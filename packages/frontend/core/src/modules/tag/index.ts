export { Tag } from './entities/tag';
export {
  affineLabelToDatabaseTagColor,
  databaseTagColorToAffineLabel,
} from './entities/utils';
export { TagService } from './service/tag';
export { useDeleteTagConfirmModal } from './view/delete-tag-modal';

import { type Framework } from '@toeverything/infra';

import { DocsService } from '../doc';
import { WorkspaceScope, WorkspaceService } from '../workspace';
import { Tag } from './entities/tag';
import { TagList } from './entities/tag-list';
import { TagService } from './service/tag';
import { TagStore } from './stores/tag';

export function configureTagModule(framework: Framework) {
  framework
    .scope(WorkspaceScope)
    .service(TagService)
    .store(TagStore, [WorkspaceService])
    .entity(TagList, [TagStore, DocsService])
    .entity(Tag, [TagStore, DocsService]);
}
