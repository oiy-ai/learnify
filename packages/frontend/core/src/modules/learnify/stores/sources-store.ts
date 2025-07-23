import type { WorkspaceService } from '@affine/core/modules/workspace';
import type { WorkspaceFlavoursService } from '@affine/core/modules/workspace/services/flavours';
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
    // eslint-disable-next-line no-unused-vars
    private readonly workspaceService: WorkspaceService,
    // eslint-disable-next-line no-unused-vars
    private readonly workspaceFlavoursService: WorkspaceFlavoursService
  ) {
    super();
    this.loadSources();
  }

  private get storageKey() {
    const workspaceId = this.workspaceService.workspace.id;
    return `${SOURCES_STORAGE_KEY}:${workspaceId}`;
  }

  private loadSources() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const sources = JSON.parse(stored) as SourceItem[];
        this.sources$.next(sources);
      }
    } catch (error) {
      console.error('[SourcesStore] Failed to load sources:', error);
    }
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

  async removeSource(id: string) {
    const source = this.getSource(id);
    if (!source) {
      console.warn(`[SourcesStore] Source not found: ${id}`);
      return;
    }

    // Delete the blob from storage if it exists
    if (source.blobId) {
      try {
        const flavours = this.workspaceFlavoursService.flavours$.value;
        const provider = flavours.find(
          f => f.flavour === this.workspaceService.workspace.flavour
        );
        if (provider) {
          await provider.deleteBlob(
            this.workspaceService.workspace.id,
            source.blobId,
            true // permanent deletion
          );
          console.log(`[SourcesStore] Deleted blob: ${source.blobId}`);
        }
      } catch (error) {
        console.error('[SourcesStore] Failed to delete blob:', error);
        // Continue with source removal even if blob deletion fails
      }
    }

    // Remove from the list
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

  // Get sources from all documents in workspace
  async getAllWorkspaceSources(): Promise<SourceItem[]> {
    // TODO: Implement scanning all documents for attachments
    // This will iterate through all docs and find attachment blocks
    return [];
  }
}
