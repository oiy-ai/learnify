import { Service } from '@toeverything/infra';

import type { WorkspaceService, WorkspacesService } from '../../workspace';
import { WorkspacePermission } from '../entities/permission';
import type { WorkspacePermissionStore } from '../stores/permission';

export class WorkspacePermissionService extends Service {
  permission = this.framework.createEntity(WorkspacePermission);

  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly workspacesService: WorkspacesService,
    private readonly store: WorkspacePermissionStore
  ) {
    super();
  }

  override dispose(): void {
    this.permission?.dispose();
  }

  async leaveWorkspace() {
    await this.store.leaveWorkspace(this.workspaceService.workspace.id);
    this.workspacesService.list.revalidate();
  }
}
