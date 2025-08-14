import { IconButton, notify, Popover } from '@affine/component';
import { WorkspaceService } from '@affine/core/modules/workspace';
import { useI18n } from '@affine/i18n';
import { openFilesWith } from '@blocksuite/affine/shared/utils';
import {
  AttachmentIcon,
  ExportToPdfIcon,
  ImageIcon,
  UploadIcon,
} from '@blocksuite/icons/rc';
import { useService } from '@toeverything/infra';
import clsx from 'clsx';
import type React from 'react';
import { useCallback, useState } from 'react';

import { MaterialsDocService } from '../../services/materials-doc';
import * as styles from './index.css';
import * as dialogStyles from './upload-dialog.css';

interface UploadButtonProps {
  className?: string;
  style?: React.CSSProperties;

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
  const workspace = useService(WorkspaceService).workspace;
  const materialsService = useService(MaterialsDocService);

  const handleUploadFiles = useCallback(
    async (acceptType?: 'Images' | 'PDF' | 'Any', fileType?: string) => {
      try {
        const files = await openFilesWith(acceptType, true);
        if (files && files.length > 0) {
          // Store files in workspace blob storage
          for (const file of files) {
            // Check file size (2MB limit)
            const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
            if (file.size > MAX_FILE_SIZE) {
              const errorMessage =
                t['com.learnify.upload.file-too-large']?.() ||
                'Large volume material support is still under development';
              notify.error({
                title:
                  t['com.learnify.upload.file-size-error']?.() ||
                  'File Size Error',
                message: errorMessage,
              });
              continue; // Skip this file and continue with others
            }

            // Generate unique blob ID
            const blobId = `learnify-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

            try {
              // Convert file to Uint8Array
              const arrayBuffer = await file.arrayBuffer();
              const data = new Uint8Array(arrayBuffer);

              // Store in blob storage
              await workspace.engine.blob.set({
                key: blobId,
                data: data,
                mime: file.type || 'application/octet-stream',
              });

              // Add material to the materials document
              await materialsService.addMaterial({
                blobId,
                name: file.name,
                type: file.type || 'application/octet-stream',
                size: file.size,
                description: `Uploaded ${fileType || 'file'}: ${file.name}`,
              });

              notify.success({
                title: 'Upload successful',
                message: `${file.name} uploaded successfully`,
              });
            } catch {
              notify.error({
                title: 'Upload failed',
                message: `Failed to upload ${file.name}`,
              });
            }
          }

          // Convert File[] to FileList for backward compatibility
          const dataTransfer = new DataTransfer();
          files.forEach(file => dataTransfer.items.add(file));
          await onUpload?.(dataTransfer.files);
        }
        setOpen(false);
      } catch {
        setOpen(false);
      }
    },
    [onUpload, workspace, materialsService, t]
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
              handleUploadFiles('Images', 'Image').catch(console.error);
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
              handleUploadFiles('PDF', 'PDF').catch(console.error);
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
              handleUploadFiles('Any', 'Attachment').catch(console.error);
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
