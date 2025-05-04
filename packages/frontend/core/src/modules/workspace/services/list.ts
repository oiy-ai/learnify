import { Service } from '@toeverything/infra';

import { WorkspaceList } from '../entities/list';

export class WorkspaceListService extends Service {
  list = this.framework.createEntity(WorkspaceList);
}
