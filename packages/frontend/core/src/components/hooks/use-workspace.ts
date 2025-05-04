import {
  type Workspace,
  type WorkspaceMetadata,
  WorkspacesService,
} from '@affine/core/modules/workspace';
import { useService } from '@toeverything/infra';
import { useEffect, useState } from 'react';

/**
 * definitely be careful when using this hook, open workspace is a heavy operation
 */
export function useWorkspace(meta?: WorkspaceMetadata | null) {
  const workspaceManager = useService(WorkspacesService);

  const [workspace, setWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    if (!meta) {
      setWorkspace(null); // set to null if meta is null or undefined
      return;
    }
    const ref = workspaceManager.open({ metadata: meta });
    setWorkspace(ref.workspace);
    return () => {
      ref.dispose();
    };
  }, [meta, workspaceManager]);

  return workspace;
}
