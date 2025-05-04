import { getWorkspacePageMetaByIdQuery } from '@affine/graphql';
import { Store } from '@toeverything/infra';

import { type CloudDocMetaType } from '../entities/cloud-doc-meta';
import type { WorkspaceServerService } from '../services/workspace-server';

export class CloudDocMetaStore extends Store {
  constructor(private readonly workspaceServerService: WorkspaceServerService) {
    super();
  }

  async fetchCloudDocMeta(
    workspaceId: string,
    docId: string,
    abortSignal?: AbortSignal
  ): Promise<CloudDocMetaType> {
    if (!this.workspaceServerService.server) {
      throw new Error('Server not found');
    }
    const serverConfigData = await this.workspaceServerService.server.gql({
      query: getWorkspacePageMetaByIdQuery,
      variables: { id: workspaceId, pageId: docId },
      context: {
        signal: abortSignal,
      },
    });
    return serverConfigData.workspace.pageMeta;
  }
}
