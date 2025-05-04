import { Entity, LiveData } from '@toeverything/infra';

import type { DocService } from '../../doc';
import type { DocsSearchService } from '../../docs-search';

export interface Backlink {
  docId: string;
  blockId: string;
  title: string;
  noteBlockId?: string;
  displayMode?: string;
  parentBlockId?: string;
  parentFlavour?: string;
  markdownPreview?: string;
}

export class DocBacklinks extends Entity {
  constructor(
    private readonly docsSearchService: DocsSearchService,
    private readonly docService: DocService
  ) {
    super();
  }

  backlinks$ = LiveData.from<Backlink[]>(
    this.docsSearchService.watchRefsTo(this.docService.doc.id),
    []
  );
}
