import { IconButton } from '@affine/component';
import { useAsyncCallback } from '@affine/core/components/hooks/affine-async-hooks';
import { useI18n } from '@affine/i18n';
import { UploadIcon } from '@blocksuite/icons/rc';
import clsx from 'clsx';
import type React from 'react';
import { type MouseEvent, useCallback } from 'react';

import * as styles from './index.css';

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

  const handleUpload = useAsyncCallback(
    // eslint-disable-next-line no-unused-vars
    async (e?: MouseEvent) => {
      // 创建文件输入元素
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = '*/*';

      input.onchange = async () => {
        if (input.files && input.files.length > 0) {
          await onUpload?.(input.files);
          // TODO: Add appropriate tracking for upload
        }
      };

      input.click();
      // TODO: Add appropriate tracking for upload trigger
    },
    [onUpload]
  );

  const onClickUpload = useCallback(
    (e?: MouseEvent) => {
      handleUpload(e);
    },
    [handleUpload]
  );

  return (
    <IconButton
      tooltip={t['Upload']()}
      tooltipOptions={sideBottom}
      data-testid="sidebar-upload-button"
      style={style}
      className={clsx([styles.root, className])}
      size={16}
      onClick={onClickUpload}
      onAuxClick={onClickUpload}
    >
      <UploadIcon />
    </IconButton>
  );
}
