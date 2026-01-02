import { Menu, MenuItem } from '@affine/component';
import { ServerService, UserFeatureService } from '@affine/core/modules/cloud';
import { WorkspaceDialogService } from '@affine/core/modules/dialogs';
import { useI18n } from '@affine/i18n';
import { track } from '@affine/track';
import {
  AccountIcon,
  AdminIcon,
  DeleteIcon,
  NotificationIcon,
  SignOutIcon,
} from '@blocksuite/icons/rc';
import { useLiveData, useService, useServices } from '@toeverything/infra';
import { useCallback, useEffect, useState } from 'react';

import { WorkbenchService } from '../../../modules/workbench';
import { useSignOut } from '../../hooks/affine/use-sign-out';
import { NotificationList } from '../../notification/list';

export const AccountMenu = () => {
  const workspaceDialogService = useService(WorkspaceDialogService);
  const openSignOutModal = useSignOut();
  const serverService = useService(ServerService);
  const userFeatureService = useService(UserFeatureService);
  const { workbenchService } = useServices({ WorkbenchService });
  const isAFFiNEAdmin = useLiveData(userFeatureService.userFeature.isAdmin$);
  const [notificationListOpen, setNotificationListOpen] = useState(false);

  const handleNotificationListOpenChange = useCallback((open: boolean) => {
    if (open) {
      track.$.sidebar.notifications.openInbox({
        unreadCount: 0,
      });
    }
    setNotificationListOpen(open);
  }, []);

  const onOpenAccountSetting = useCallback(() => {
    track.$.navigationPanel.profileAndBadge.openSettings({ to: 'account' });
    workspaceDialogService.open('setting', {
      activeTab: 'account',
    });
  }, [workspaceDialogService]);

  const onOpenAdminPanel = useCallback(() => {
    window.open(`${serverService.server.baseUrl}/admin`, '_blank');
  }, [serverService.server.baseUrl]);

  const onOpenTrash = useCallback(() => {
    workbenchService.workbench.openTrash();
  }, [workbenchService]);

  const t = useI18n();

  useEffect(() => {
    userFeatureService.userFeature.revalidate();
  }, [userFeatureService]);

  return (
    <>
      <Menu
        rootOptions={{
          open: notificationListOpen,
          onOpenChange: handleNotificationListOpenChange,
          modal: true,
        }}
        contentOptions={{
          side: 'left',
          sideOffset: 8,
          align: 'start',
        }}
        items={<NotificationList />}
      >
        <MenuItem
          prefixIcon={<NotificationIcon />}
          data-testid="workspace-modal-notification-option"
        >
          {t['com.affine.rootAppSidebar.notifications']()}
        </MenuItem>
      </Menu>
      <MenuItem
        prefixIcon={<AccountIcon />}
        data-testid="workspace-modal-account-settings-option"
        onClick={onOpenAccountSetting}
      >
        {t['com.affine.workspace.cloud.account.settings']()}
      </MenuItem>
      {isAFFiNEAdmin ? (
        <MenuItem
          prefixIcon={<AdminIcon />}
          data-testid="workspace-modal-account-admin-option"
          onClick={onOpenAdminPanel}
        >
          {t['com.affine.workspace.cloud.account.admin']()}
        </MenuItem>
      ) : null}
      <MenuItem
        prefixIcon={<DeleteIcon />}
        data-testid="workspace-modal-trash-option"
        onClick={onOpenTrash}
      >
        {t['com.affine.workspaceSubPath.trash']()}
      </MenuItem>
      <MenuItem
        prefixIcon={<SignOutIcon />}
        data-testid="workspace-modal-sign-out-option"
        onClick={openSignOutModal}
      >
        {t['com.affine.workspace.cloud.account.logout']()}
      </MenuItem>
    </>
  );
};
