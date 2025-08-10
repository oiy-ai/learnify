import { Button } from '@affine/component';
import { useSharingUrl } from '@affine/core/components/hooks/affine/use-share-url';
import { DocService } from '@affine/core/modules/doc';
import { EditorService } from '@affine/core/modules/editor';
import { useI18n } from '@affine/i18n';
import type { DocMode } from '@blocksuite/affine/model';
import { useLiveData, useService } from '@toeverything/infra';
import clsx from 'clsx';
import { useCallback } from 'react';

import * as styles from './copy-link-button.css';

export const CopyLinkButton = ({
  workspaceId,
  secondary,
}: {
  secondary?: boolean;
  workspaceId: string;
}) => {
  const t = useI18n();

  const editor = useService(EditorService).editor;
  const docService = useService(DocService);

  // Get the document's primary mode
  const primaryMode = useLiveData(docService.doc.primaryMode$);

  const { onClickCopyLink } = useSharingUrl({
    workspaceId,
    pageId: editor.doc.id,
  });

  // Copy link with the document's primary mode
  const onCopyLink = useCallback(() => {
    // If primary mode is edgeless, share as edgeless, otherwise share as page
    const shareMode: DocMode = primaryMode === 'edgeless' ? 'edgeless' : 'page';
    onClickCopyLink(shareMode);
  }, [onClickCopyLink, primaryMode]);

  return (
    <div
      className={clsx(styles.copyLinkContainerStyle, { secondary: secondary })}
    >
      <Button
        className={styles.copyLinkButtonStyle}
        onClick={onCopyLink}
        withoutHover
        variant={secondary ? 'secondary' : 'primary'}
        data-testid="share-menu-copy-link-button"
        style={{ width: '100%' }}
      >
        <span
          className={clsx(styles.copyLinkLabelStyle, {
            secondary: secondary,
          })}
        >
          {t['com.affine.share-menu.copy']()}
        </span>
        {BUILD_CONFIG.isDesktopEdition && (
          <span
            className={clsx(styles.copyLinkShortcutStyle, {
              secondary: secondary,
            })}
          >
            {environment.isMacOs ? '⌘ + ⌥ + C' : 'Ctrl + Shift + C'}
          </span>
        )}
      </Button>
    </div>
  );
};
