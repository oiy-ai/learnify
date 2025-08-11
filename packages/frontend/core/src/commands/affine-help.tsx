import type { useI18n } from '@affine/i18n';
import { track } from '@affine/track';
import { NewIcon } from '@blocksuite/icons/rc';

import type { WorkspaceDialogService } from '../modules/dialogs';
import type { UrlService } from '../modules/url';
import { registerAffineCommand } from './registry';

export function registerAffineHelpCommands({
  t,
  urlService,
  // workspaceDialogService,
}: {
  t: ReturnType<typeof useI18n>;
  urlService: UrlService;
  workspaceDialogService: WorkspaceDialogService;
}) {
  const unsubs: Array<() => void> = [];
  unsubs.push(
    registerAffineCommand({
      id: 'affine:help-whats-new',
      category: 'affine:help',
      icon: <NewIcon />,
      label: t['com.affine.cmdk.affine.whats-new'](),
      run() {
        track.$.cmdk.help.openChangelog();
        urlService.openPopupWindow(BUILD_CONFIG.changelogUrl);
      },
    })
  );

  return () => {
    unsubs.forEach(unsub => unsub());
  };
}
