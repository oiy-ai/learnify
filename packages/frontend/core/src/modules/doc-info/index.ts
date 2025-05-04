import { type Framework } from '@toeverything/infra';

import { DocsService } from '../doc/services/docs';
import { DocsSearchService } from '../docs-search';
import { WorkspaceScope } from '../workspace';
import { DocDatabaseBacklinksService } from './services/doc-database-backlinks';

export { DocDatabaseBacklinkInfo } from './views/database-properties/doc-database-backlink-info';

export function configureDocInfoModule(framework: Framework) {
  framework
    .scope(WorkspaceScope)
    .service(DocDatabaseBacklinksService, [DocsService, DocsSearchService]);
}
