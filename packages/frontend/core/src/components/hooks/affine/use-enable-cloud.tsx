import { notify, useConfirmModal } from '@affine/component';
import { AuthService, ServersService } from '@affine/core/modules/cloud';
import { GlobalDialogService } from '@affine/core/modules/dialogs';
import type { Workspace } from '@affine/core/modules/workspace';
import { WorkspacesService } from '@affine/core/modules/workspace';
import { useI18n } from '@affine/i18n';
import { useLiveData, useService } from '@toeverything/infra';
import { useCallback } from 'react';

import { useNavigateHelper } from '../use-navigate-helper';

interface ConfirmEnableCloudOptions {
  /**
   * Fired when the workspace is successfully enabled
   */
  onSuccess?: () => void;
  /**
   * Fired when workspace is successfully enabled or user cancels the operation
   */
  onFinished?: () => void;
  openPageId?: string;
  serverId?: string;
}
type ConfirmEnableArgs = [Workspace, ConfirmEnableCloudOptions | undefined];

export const useEnableCloud = () => {
  const t = useI18n();
  const authService = useService(AuthService);
  const account = useLiveData(authService.session.account$);
  const loginStatus = useLiveData(useService(AuthService).session.status$);
  const globalDialogService = useService(GlobalDialogService);
  const { openConfirmModal, closeConfirmModal } = useConfirmModal();
  const workspacesService = useService(WorkspacesService);
  const serversService = useService(ServersService);
  const serverList = useLiveData(serversService.servers$);

  const { jumpToPage } = useNavigateHelper();

  const enableCloud = useCallback(
    async (ws: Workspace | null, options?: ConfirmEnableCloudOptions) => {
      try {
        if (!ws) return;
        if (!account) return;
        const { id: newId } = await workspacesService.transformLocalToCloud(
          ws,
          account.id,
          'affine-cloud'
        );
        jumpToPage(newId, options?.openPageId || 'all');
        options?.onSuccess?.();
      } catch (e) {
        console.error(e);
        notify.error({
          title: t['com.affine.workspace.enable-cloud.failed'](),
        });
      }
    },
    [account, jumpToPage, t, workspacesService]
  );

  const openSignIn = useCallback(
    () =>
      globalDialogService.open('sign-in', {
        step: 'signIn',
      }),
    [globalDialogService]
  );

  const signInOrEnableCloud = useCallback(
    async (...args: ConfirmEnableArgs) => {
      // not logged in, open login modal
      if (loginStatus === 'unauthenticated') {
        openSignIn();
      }

      if (loginStatus === 'authenticated') {
        await enableCloud(...args);
      }
    },
    [enableCloud, loginStatus, openSignIn]
  );

  const confirmEnableCloud = useCallback(
    (ws: Workspace, options?: ConfirmEnableCloudOptions) => {
      const { onSuccess, onFinished, serverId, openPageId } = options ?? {};

      const closeOnSuccess = () => {
        closeConfirmModal();
        onSuccess?.();
      };

      if (serverList.length > 1) {
        globalDialogService.open('enable-cloud', {
          workspaceId: ws.id,
          serverId,
          openPageId,
        });
        return;
      }

      openConfirmModal(
        {
          title: t['Enable AFFiNE Cloud'](),
          description: t['Enable AFFiNE Cloud Description'](),
          cancelText: t['com.affine.enableAffineCloudModal.button.cancel'](),
          confirmText:
            loginStatus === 'authenticated'
              ? t['Enable']()
              : t['Sign in and Enable'](),
          confirmButtonOptions: {
            variant: 'primary',
            ['data-testid' as string]: 'confirm-enable-affine-cloud-button',
          },
          onConfirm: async () =>
            await signInOrEnableCloud(ws, {
              ...options,
              onSuccess: closeOnSuccess,
            }),
          onOpenChange: open => {
            if (!open) onFinished?.();
          },
        },
        {
          autoClose: false,
        }
      );
    },
    [
      closeConfirmModal,
      globalDialogService,
      loginStatus,
      openConfirmModal,
      serverList.length,
      signInOrEnableCloud,
      t,
    ]
  );

  return confirmEnableCloud;
};
