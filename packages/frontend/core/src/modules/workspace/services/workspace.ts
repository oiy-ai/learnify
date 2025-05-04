import { Service } from '@toeverything/infra';

import { Workspace } from '../entities/workspace';

export class WorkspaceService extends Service {
  _workspace: Workspace | null = null;

  get workspace() {
    if (!this._workspace) {
      this._workspace = this.framework.createEntity(Workspace);
    }
    return this._workspace;
  }

  override dispose(): void {
    this._workspace?.dispose();
  }
}
