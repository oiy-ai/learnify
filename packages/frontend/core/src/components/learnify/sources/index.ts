export * from './services/materials-doc';

import type { Framework } from '@toeverything/infra';

import { DocsService } from '../../../modules/doc';
import { WorkspaceScope } from '../../../modules/workspace';
import { MaterialsDocService } from './services/materials-doc';

export function configureLearnifySourcesModule(framework: Framework) {
  framework.scope(WorkspaceScope).service(MaterialsDocService, [DocsService]);
}
