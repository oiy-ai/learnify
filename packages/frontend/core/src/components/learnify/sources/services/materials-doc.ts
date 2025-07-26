import type { AttachmentBlockModel } from '@blocksuite/affine/model';
import { NoteDisplayMode } from '@blocksuite/affine/model';
import type { Store } from '@blocksuite/affine/store';
import { Text } from '@blocksuite/affine/store';
import { LiveData, Service } from '@toeverything/infra';
import { Observable } from 'rxjs';

import type { DocsService } from '../../../../modules/doc';

const MATERIALS_DOC_ID = 'learnify-list-of-materials';

export interface MaterialItem {
  id: string;
  name: string;
  description: string;
  blobId: string;
  mimeType: string;
  size: number;
  category: 'pdf' | 'image' | 'link' | 'attachment';
}

export class MaterialsDocService extends Service {
  materials$ = new LiveData<MaterialItem[]>([]);

  // eslint-disable-next-line no-unused-vars
  constructor(private readonly docsService: DocsService) {
    super();

    // Initialize materials monitoring
    const subscription = this.watchMaterials().subscribe(materials => {
      this.materials$.next(materials);
    });

    this.disposables.push(() => subscription.unsubscribe());

    // Ensure materials doc exists when service is initialized
    this.ensureMaterialsDoc().catch(error => {
      console.error(
        '[MaterialsDocService] Failed to ensure materials doc:',
        error
      );
    });
  }

  private async ensureMaterialsDoc(): Promise<Store> {
    const docRecord = this.docsService.list.doc$(MATERIALS_DOC_ID).value;

    if (!docRecord) {
      // Create the materials doc if it doesn't exist
      const newDoc = this.docsService.createDoc({
        id: MATERIALS_DOC_ID,
        docProps: {
          page: { title: new Text('Learnify Materials') },
          note: { displayMode: NoteDisplayMode.DocOnly },
          paragraph: {
            text: new Text(
              'This document contains all uploaded materials for Learnify.'
            ),
          },
        },
      });
      newDoc.setProperty('isLearnifyMaterials', true);
    }

    const { doc, release } = this.docsService.open(MATERIALS_DOC_ID);
    this.disposables.push(release);
    await doc.waitForSyncReady();

    return doc.blockSuiteDoc;
  }

  async getMaterials(): Promise<MaterialItem[]> {
    const doc = await this.ensureMaterialsDoc();

    const attachmentBlocks = doc.getBlocksByFlavour('affine:attachment');

    const materials: MaterialItem[] = [];

    for (const block of attachmentBlocks) {
      try {
        // Access model properties correctly
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

    return materials;
  }

  async addMaterial(file: {
    name: string;
    type: string;
    size: number;
    blobId: string;
    description?: string;
  }): Promise<void> {
    const doc = await this.ensureMaterialsDoc();

    // Get the first note block to add attachment
    const noteBlocks = doc.getBlocksByFlavour('affine:note');
    const noteBlock =
      noteBlocks.find(block => {
        const model = block.model as any;
        return model.displayMode !== NoteDisplayMode.EdgelessOnly;
      }) || noteBlocks[0];

    if (!noteBlock) {
      throw new Error('No note block found in materials document');
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

  async removeMaterial(attachmentId: string): Promise<void> {
    const doc = await this.ensureMaterialsDoc();
    const attachmentBlocks = doc.getBlocksByFlavour('affine:attachment');
    const attachmentBlock = attachmentBlocks.find(
      block => block.id === attachmentId
    );

    if (attachmentBlock) {
      doc.deleteBlock(attachmentBlock.model);
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
      this.ensureMaterialsDoc()
        .then(doc => {
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
          // If doc creation fails, emit empty array
          subscriber.next([]);
        });
    });
  }
}
