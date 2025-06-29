import { IconButton } from '@affine/component';
import { useAsyncCallback } from '@affine/core/components/hooks/affine-async-hooks';
import { useI18n } from '@affine/i18n';
import { LinkIcon } from '@blocksuite/icons/rc';
import clsx from 'clsx';
import type React from 'react';
import { type MouseEvent, useCallback } from 'react';

import * as styles from './index.css';

interface AddLinkButtonProps {
  className?: string;
  style?: React.CSSProperties;
  // eslint-disable-next-line no-unused-vars
  onAddLink?: (url: string) => Promise<void> | void;
}

const sideBottom = { side: 'bottom' as const };

export function AddLinkButton({
  className,
  style,
  onAddLink,
}: AddLinkButtonProps) {
  const t = useI18n();

  const handleAddLink = useAsyncCallback(
    // eslint-disable-next-line no-unused-vars
    async (e?: MouseEvent) => {
      // 弹出输入URL的对话框
      const url = prompt('请输入URL链接:');

      if (url && url.trim()) {
        // 简单的URL验证
        const trimmedUrl = url.trim();
        let validUrl = trimmedUrl;

        // 如果URL不以协议开头，添加https://
        if (
          !trimmedUrl.startsWith('http://') &&
          !trimmedUrl.startsWith('https://')
        ) {
          validUrl = 'https://' + trimmedUrl;
        }

        try {
          // 验证URL格式
          new URL(validUrl);
          await onAddLink?.(validUrl);
          // TODO: Add appropriate tracking for link addition
        } catch (error) {
          console.error(error);
          alert('请输入有效的URL链接');
        }
      }
    },
    [onAddLink]
  );

  const onClickAddLink = useCallback(
    (e?: MouseEvent) => {
      handleAddLink(e);
    },
    [handleAddLink]
  );

  return (
    <IconButton
      tooltip={t['Add Link']?.() || '添加链接'}
      tooltipOptions={sideBottom}
      data-testid="sidebar-add-link-button"
      style={style}
      className={clsx([styles.root, className])}
      size={16}
      onClick={onClickAddLink}
      onAuxClick={onClickAddLink}
    >
      <LinkIcon />
    </IconButton>
  );
}
