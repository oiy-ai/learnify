import { DocsService } from '@affine/core/modules/doc';
import { WorkspaceService } from '@affine/core/modules/workspace';
import { LiveData, Service } from '@toeverything/infra';

export interface SourceItem {
  id: string;
  blobId: string;
  name: string;
  category: 'pdf' | 'image' | 'link' | 'attachment';
  url?: string;
  description: string;
  mimeType?: string;
  size?: number;
  uploadDate: number;
  workspaceId: string;
}

const SOURCES_STORAGE_KEY = 'learnify:sources';

export class SourcesStore extends Service {
  sources$ = new LiveData<SourceItem[]>([]);

  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly docsService: DocsService
  ) {
    super();
    this.loadSourcesFromDocument().catch(() => {
      // Silently fail
    });
  }

  private get storageKey() {
    const workspaceId = this.workspaceService.workspace.id;
    return `${SOURCES_STORAGE_KEY}:${workspaceId}`;
  }

  private async loadSourcesFromDocument() {
    try {
      // Use the known document ID for learnify-list-of-materials
      const docId = 'Y3sx62lSB5Incw4BMyEFC';
      const { doc, release } = this.docsService.open(docId);
      
      await doc.waitForSyncReady();
      const sources = this.extractSourcesFromDocument(doc);
      this.sources$.next(sources);
      
      release();
    } catch {
      // Silently fail if document not found
    }
  }

  private extractSourcesFromDocument(doc: any): SourceItem[] {
    const sources: SourceItem[] = [];
    const blockSuiteDoc = doc.blockSuiteDoc;
    
    // Get the note block which contains all content
    const noteBlocks = blockSuiteDoc.getBlocksByFlavour('affine:note');
    if (noteBlocks.length === 0) return sources;
    
    const noteBlock = noteBlocks[0];
    if (!noteBlock.model?.children) return sources;
    
    // Process children in order
    noteBlock.model.children.forEach((child: any) => {
      const flavour = child.flavour;
      
      // Skip text paragraphs and other non-media blocks
      if (flavour === 'affine:paragraph' || flavour === 'affine:list') {
        return;
      }
      
      // Handle attachment blocks (PDFs and other files)
      if (flavour === 'affine:attachment') {
        const category = this.determineAttachmentCategory(child);
        sources.push({
          id: `source-${child.id}`,
          blobId: child.sourceId || child.id,
          name: child.name || `Unnamed ${category}`,
          category,
          description: child.caption || `${category} file`,
          mimeType: child.type || 'application/octet-stream',
          size: child.size,
          uploadDate: Date.now(),
          workspaceId: this.workspaceService.workspace.id,
        });
      }
      
      // Handle image blocks
      else if (flavour === 'affine:image') {
        sources.push({
          id: `source-${child.id}`,
          blobId: child.sourceId || child.id,
          name: child.caption || 'Image',
          category: 'image',
          description: child.caption || 'Image file',
          mimeType: 'image/*',
          size: child.size,
          uploadDate: Date.now(),
          workspaceId: this.workspaceService.workspace.id,
        });
      }
      
      // Handle bookmark blocks (videos)
      else if (flavour === 'affine:bookmark') {
        sources.push({
          id: `bookmark-${child.id}`,
          blobId: child.id,
          name: child.title || 'Video Link',
          category: 'link',
          url: child.url,
          description: child.description || 'Video link',
          mimeType: 'text/html',
          uploadDate: Date.now(),
          workspaceId: this.workspaceService.workspace.id,
        });
      }
    });
    
    return sources;
  }

  private determineAttachmentCategory(attachment: any): 'pdf' | 'image' | 'link' | 'attachment' {
    const type = attachment.type || '';
    const name = attachment.name || '';
    
    if (type === 'application/pdf' || name.endsWith('.pdf')) {
      return 'pdf';
    } else if (type.startsWith('image/')) {
      return 'image';
    } else if (type.startsWith('video/')) {
      return 'attachment'; // Videos as attachments
    }
    
    return 'attachment';
  }

  private saveSources() {
    try {
      const sources = this.sources$.value;
      localStorage.setItem(this.storageKey, JSON.stringify(sources));
    } catch (error) {
      console.error('[SourcesStore] Failed to save sources:', error);
    }
  }

  addSource(source: Omit<SourceItem, 'id' | 'uploadDate' | 'workspaceId'>) {
    const newSource: SourceItem = {
      ...source,
      id: `source-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      uploadDate: Date.now(),
      workspaceId: this.workspaceService.workspace.id,
    };

    const currentSources = this.sources$.value;
    this.sources$.next([...currentSources, newSource]);
    this.saveSources();

    return newSource;
  }

  removeSource(id: string) {
    const currentSources = this.sources$.value;
    this.sources$.next(currentSources.filter(s => s.id !== id));
    this.saveSources();
  }

  getSource(id: string) {
    return this.sources$.value.find(s => s.id === id);
  }

  getAllSources() {
    return this.sources$.value;
  }

  // Refresh sources from document
  async refreshSources() {
    await this.loadSourcesFromDocument();
  }

  // Get sources from all documents in workspace
  async getAllWorkspaceSources(): Promise<SourceItem[]> {
    // TODO: Implement scanning all documents for attachments
    // This will iterate through all docs and find attachment blocks
    return [];
  }
}