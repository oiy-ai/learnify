import { type Framework } from '@toeverything/infra';

import { DocsService } from '../doc';
import { WorkspaceScope, WorkspaceService } from '../workspace';
import { SourcesStore } from './stores/sources-store';

export type { SourceItem } from './stores/sources-store';
export { SourcesStore } from './stores/sources-store';

export function configureLearnifyModule(framework: Framework) {
  framework
    .scope(WorkspaceScope)
    .store(SourcesStore, [WorkspaceService, DocsService]);
}
