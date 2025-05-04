export { CollectionService } from './services/collection';

import { type Framework } from '@toeverything/infra';

import { WorkspaceScope, WorkspaceService } from '../workspace';
import { CollectionService } from './services/collection';

export function configureCollectionModule(framework: Framework) {
  framework
    .scope(WorkspaceScope)
    .service(CollectionService, [WorkspaceService]);
}
