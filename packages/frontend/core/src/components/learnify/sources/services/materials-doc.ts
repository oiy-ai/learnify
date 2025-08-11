import type {
  AttachmentBlockModel,
  BookmarkBlockModel,
  EmbedYoutubeModel,
} from '@blocksuite/affine/model';
import { NoteDisplayMode } from '@blocksuite/affine/model';
import type { Store } from '@blocksuite/affine/store';
import { LiveData, Service } from '@toeverything/infra';
import { Observable } from 'rxjs';

import { LEARNIFY_DOCUMENTS } from '../../../../constants/learnify-documents';
import type { DocsService } from '../../../../modules/doc';

export interface MaterialItem {
  id: string;
  name: string;
  description: string;
  blobId: string;
  mimeType: string;
  size: number;
  category: 'pdf' | 'image' | 'link' | 'attachment';
}

export interface YouTubeVideoData {
  url: string;
  title?: string;
  description?: string;
}

export interface LinkData {
  url: string;
  title?: string;
  description?: string;
}

export class MaterialsDocService extends Service {
  materials$ = new LiveData<MaterialItem[]>([]);

  constructor(private readonly docsService: DocsService) {
    super();

    // Initialize materials monitoring
    const subscription = this.watchMaterials().subscribe(materials => {
      this.materials$.next(materials);
    });

    this.disposables.push(() => subscription.unsubscribe());
  }

  async getMaterialsDoc(): Promise<Store | null> {
    const docRecord = this.docsService.list.doc$(
      LEARNIFY_DOCUMENTS.MATERIALS
    ).value;

    if (!docRecord) {
      return null;
    }

    const { doc, release } = this.docsService.open(
      LEARNIFY_DOCUMENTS.MATERIALS
    );
    this.disposables.push(release);
    await doc.waitForSyncReady();

    return doc.blockSuiteDoc;
  }

  async getMaterials(): Promise<MaterialItem[]> {
    const doc = await this.getMaterialsDoc();
    if (!doc) {
      return [];
    }

    const materials: MaterialItem[] = [];
    const blockOrder = this.getBlockOrder(doc);

    // Process different types of blocks
    const attachmentBlocks = doc.getBlocksByFlavour('affine:attachment');
    const youtubeBlocks = doc.getBlocksByFlavour('affine:embed-youtube');
    const bookmarkBlocks = doc.getBlocksByFlavour('affine:bookmark');

    // Process attachment blocks
    for (const block of attachmentBlocks) {
      try {
        const model = block.model as AttachmentBlockModel;
        const props = model.props || {};

        const item: MaterialItem = {
          id: block.id,
          name: props.name || 'Untitled',
          description: props.caption || '',
          blobId: props.sourceId || '',
          mimeType: props.type || 'application/octet-stream',
          size: props.size || 0,
          category: this.getCategory(props.type || ''),
        };

        materials.push(item);
      } catch (error) {
        console.error(
          '[MaterialsDocService] Error processing attachment:',
          error
        );
      }
    }

    // Process YouTube embed blocks
    for (const block of youtubeBlocks) {
      try {
        const model = block.model as EmbedYoutubeModel;
        const props = model.props || {};

        const item: MaterialItem = {
          id: block.id,
          name: props.title || 'YouTube Video',
          description: props.caption || props.description || '',
          blobId: props.videoId || props.url || '',
          mimeType: 'video/youtube',
          size: 0,
          category: 'link',
        };

        materials.push(item);
      } catch (error) {
        console.error(
          '[MaterialsDocService] Error processing YouTube embed:',
          error
        );
      }
    }

    // Process bookmark blocks (general links, not YouTube)
    for (const block of bookmarkBlocks) {
      try {
        const model = block.model as BookmarkBlockModel;
        const props = model.props || {};

        // Skip if this is a YouTube URL (should use embed-youtube instead)
        if (this.isYouTubeUrl(props.url || '')) {
          continue;
        }

        const item: MaterialItem = {
          id: block.id,
          name: props.title || 'Web Link',
          description: props.caption || props.description || '',
          blobId: props.url || '',
          mimeType: 'text/html',
          size: 0,
          category: 'link',
        };

        materials.push(item);
      } catch (error) {
        console.error(
          '[MaterialsDocService] Error processing bookmark:',
          error
        );
      }
    }

    // Sort materials based on their order in the document
    const sortedMaterials = materials.sort((a, b) => {
      const aOrder = blockOrder.find(block => block.id === a.id);
      const bOrder = blockOrder.find(block => block.id === b.id);
      return (aOrder?.index || 0) - (bOrder?.index || 0);
    });

    return sortedMaterials;
  }

  async addMaterial(file: {
    name: string;
    type: string;
    size: number;
    blobId: string;
    description?: string;
  }): Promise<void> {
    const doc = await this.getMaterialsDoc();
    if (!doc) {
      throw new Error('Materials document not found');
    }

    // Get the first note block to add attachment; create one if missing
    const noteBlocks = doc.getBlocksByFlavour('affine:note');
    let noteBlock =
      noteBlocks.find(block => {
        const model = block.model as any;
        return model.displayMode !== NoteDisplayMode.EdgelessOnly;
      }) || noteBlocks[0];

    if (!noteBlock) {
      const pageBlocks = doc.getBlocksByFlavour('affine:page');
      if (!pageBlocks.length) {
        throw new Error('No note block found in materials document');
      }
      doc.addBlock(
        'affine:note' as never,
        { displayMode: NoteDisplayMode.DocOnly },
        pageBlocks[0].id
      );
      const refreshedNotes = doc.getBlocksByFlavour('affine:note');
      noteBlock = refreshedNotes[0];
      if (!noteBlock) {
        throw new Error('No note block found in materials document');
      }
    }

    // Add attachment block
    doc.addBlock(
      'affine:attachment' as never,
      {
        name: file.name,
        size: file.size,
        type: file.type,
        sourceId: file.blobId,
        caption: file.description || '',
        embed: false,
      },
      noteBlock.id
    );
  }

  async addYouTubeVideo(videoData: YouTubeVideoData): Promise<void> {
    const doc = await this.getMaterialsDoc();
    if (!doc) {
      throw new Error('Materials document not found');
    }

    // Get the first note block to add YouTube embed; create one if missing
    const noteBlocks = doc.getBlocksByFlavour('affine:note');
    let noteBlock =
      noteBlocks.find(block => {
        const model = block.model as any;
        return model.displayMode !== NoteDisplayMode.EdgelessOnly;
      }) || noteBlocks[0];

    if (!noteBlock) {
      const pageBlocks = doc.getBlocksByFlavour('affine:page');
      if (!pageBlocks.length) {
        throw new Error('No note block found in materials document');
      }
      doc.addBlock(
        'affine:note' as never,
        { displayMode: NoteDisplayMode.DocOnly },
        pageBlocks[0].id
      );
      const refreshedNotes = doc.getBlocksByFlavour('affine:note');
      noteBlock = refreshedNotes[0];
      if (!noteBlock) {
        throw new Error('No note block found in materials document');
      }
    }

    // Extract video ID from URL
    const videoId = this.extractYouTubeVideoId(videoData.url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    // Add YouTube embed block
    doc.addBlock(
      'affine:embed-youtube' as never,
      {
        url: videoData.url,
        videoId,
        style: 'video',
        title: videoData.title || null,
        description: videoData.description || null,
        caption: null,
        image: null,
        creator: null,
        creatorUrl: null,
        creatorImage: null,
      },
      noteBlock.id
    );
  }

  async addLink(linkData: LinkData): Promise<void> {
    const doc = await this.getMaterialsDoc();
    if (!doc) {
      throw new Error('Materials document not found');
    }

    // Get the first note block to add bookmark; create one if missing
    const noteBlocks = doc.getBlocksByFlavour('affine:note');
    let noteBlock =
      noteBlocks.find(block => {
        const model = block.model as any;
        return model.displayMode !== NoteDisplayMode.EdgelessOnly;
      }) || noteBlocks[0];

    if (!noteBlock) {
      const pageBlocks = doc.getBlocksByFlavour('affine:page');
      if (!pageBlocks.length) {
        throw new Error('No note block found in materials document');
      }
      doc.addBlock(
        'affine:note' as never,
        { displayMode: NoteDisplayMode.DocOnly },
        pageBlocks[0].id
      );
      const refreshedNotes = doc.getBlocksByFlavour('affine:note');
      noteBlock = refreshedNotes[0];
      if (!noteBlock) {
        throw new Error('No note block found in materials document');
      }
    }

    // Validate URL
    try {
      new URL(linkData.url);
    } catch {
      throw new Error('Invalid URL');
    }

    // Add bookmark block (Card view)
    doc.addBlock(
      'affine:bookmark' as never,
      {
        url: linkData.url,
        title: linkData.title || null,
        description: linkData.description || null,
        caption: null,
        icon: null,
        image: null,
        style: 'horizontal',
      },
      noteBlock.id
    );
  }

  private getBlockOrder(
    doc: Store
  ): { id: string; index: number; type: string }[] {
    const blockOrder: { id: string; index: number; type: string }[] = [];
    const pageBlocks = doc.getBlocksByFlavour('affine:page');

    if (pageBlocks.length > 0) {
      const pageModel = pageBlocks[0].model;
      const children = this.getAllChildrenRecursively(pageModel);

      children.forEach((child, index) => {
        if (this.isMaterialBlock(child.flavour)) {
          blockOrder.push({ id: child.id, index, type: child.flavour });
        }
      });
    }

    return blockOrder;
  }

  private getAllChildrenRecursively(block: any): any[] {
    const children: any[] = [];
    if (block.children) {
      for (const child of block.children) {
        children.push(child);
        children.push(...this.getAllChildrenRecursively(child));
      }
    }
    return children;
  }

  private isMaterialBlock(flavour: string): boolean {
    return [
      'affine:attachment',
      'affine:embed-youtube',
      'affine:bookmark',
    ].includes(flavour);
  }

  private isYouTubeUrl(url: string): boolean {
    return this.extractYouTubeVideoId(url) !== null;
  }

  private extractYouTubeVideoId(url: string): string | null {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  async removeMaterial(materialId: string): Promise<void> {
    const doc = await this.getMaterialsDoc();
    if (!doc) {
      throw new Error('Materials document not found');
    }

    // Try to find and delete attachment blocks
    const attachmentBlocks = doc.getBlocksByFlavour('affine:attachment');
    const attachmentBlock = attachmentBlocks.find(
      block => block.id === materialId
    );

    if (attachmentBlock) {
      doc.deleteBlock(attachmentBlock.model);
      return;
    }

    // Try to find and delete YouTube blocks
    const youtubeBlocks = doc.getBlocksByFlavour('affine:embed-youtube');
    const youtubeBlock = youtubeBlocks.find(block => block.id === materialId);

    if (youtubeBlock) {
      doc.deleteBlock(youtubeBlock.model);
      return;
    }

    // Try to find and delete bookmark blocks
    const bookmarkBlocks = doc.getBlocksByFlavour('affine:bookmark');
    const bookmarkBlock = bookmarkBlocks.find(block => block.id === materialId);

    if (bookmarkBlock) {
      doc.deleteBlock(bookmarkBlock.model);
    }
  }

  private getCategory(mimeType: string): MaterialItem['category'] {
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'link';
    return 'attachment';
  }

  watchMaterials(): Observable<MaterialItem[]> {
    return new Observable(subscriber => {
      this.getMaterialsDoc()
        .then(doc => {
          if (!doc) {
            // If doc doesn't exist, just emit empty array
            subscriber.next([]);
            return;
          }

          // Initial emit
          this.getMaterials()
            .then(materials => {
              subscriber.next(materials);
            })
            .catch(() => {
              // Ignore errors in initial emit
            });

          // Watch for changes with debounce
          let timeout: any;
          const disposable = doc.slots.blockUpdated.subscribe(() => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
              this.getMaterials()
                .then(materials => {
                  subscriber.next(materials);
                })
                .catch(() => {
                  // Ignore errors in updates
                });
            }, 100);
          });

          return () => {
            disposable.unsubscribe();
          };
        })
        .catch(() => {
          // If error accessing doc, emit empty array
          subscriber.next([]);
        });
    });
  }
}
