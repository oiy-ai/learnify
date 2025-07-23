import { IconButton, Popover } from '@affine/component';
import { useI18n } from '@affine/i18n';
import { openFilesWith } from '@blocksuite/affine/shared/utils';
import {
  AttachmentIcon,
  ExportToPdfIcon,
  ImageIcon,
  UploadIcon,
} from '@blocksuite/icons/rc';
import clsx from 'clsx';
import type React from 'react';
import { useCallback, useState } from 'react';

import * as styles from './index.css';
import * as dialogStyles from './upload-dialog.css';

interface UploadButtonProps {
  className?: string;
  style?: React.CSSProperties;
  // eslint-disable-next-line no-unused-vars
  onUpload?: (files: FileList) => Promise<void> | void;
}

const sideBottom = { side: 'bottom' as const };

export function UploadButton({
  className,
  style,
  onUpload,
}: UploadButtonProps) {
  const t = useI18n();
  const [open, setOpen] = useState(false);

  const handleUploadFiles = useCallback(
    async (acceptType?: 'Images' | 'Any') => {
      const files = await openFilesWith(acceptType, true);
      if (files && files.length > 0) {
        // Convert File[] to FileList
        const dataTransfer = new DataTransfer();
        files.forEach(file => dataTransfer.items.add(file));
        await onUpload?.(dataTransfer.files);
      }
      setOpen(false);
    },
    [onUpload]
  );

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      content={
        <div className={dialogStyles.menuContent}>
          <div
            className={dialogStyles.menuItem}
            onClick={() => {
              handleUploadFiles('Images').catch(console.error);
            }}
          >
            <ImageIcon className={dialogStyles.menuIcon} />
            <div className={dialogStyles.menuItemContent}>
              <div className={dialogStyles.menuItemTitle}>{t['Image']()}</div>
              <div className={dialogStyles.menuItemDescription}>
                Insert an image.
              </div>
            </div>
          </div>
          <div
            className={dialogStyles.menuItem}
            onClick={() => {
              handleUploadFiles('Any').catch(console.error);
            }}
          >
            <ExportToPdfIcon className={dialogStyles.menuIcon} />
            <div className={dialogStyles.menuItemContent}>
              <div className={dialogStyles.menuItemTitle}>PDF</div>
              <div className={dialogStyles.menuItemDescription}>
                Upload a PDF to document.
              </div>
            </div>
          </div>
          <div
            className={dialogStyles.menuItem}
            onClick={() => {
              handleUploadFiles('Any').catch(console.error);
            }}
          >
            <AttachmentIcon className={dialogStyles.menuIcon} />
            <div className={dialogStyles.menuItemContent}>
              <div className={dialogStyles.menuItemTitle}>Attachment</div>
              <div className={dialogStyles.menuItemDescription}>
                Attach a file to document.
              </div>
            </div>
          </div>
        </div>
      }
      contentOptions={{
        side: 'bottom',
        align: 'start',
        sideOffset: 8,
      }}
    >
      <IconButton
        tooltip={t['Upload']()}
        tooltipOptions={sideBottom}
        data-testid="sidebar-upload-button"
        style={style}
        className={clsx([styles.root, className])}
        size={16}
      >
        <UploadIcon />
      </IconButton>
    </Popover>
  );
}
