import { IconButton, Popover } from '@affine/component';
import { useI18n } from '@affine/i18n';
import { LinkIcon } from '@blocksuite/icons/rc';
import clsx from 'clsx';
import type React from 'react';
import { useState } from 'react';

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
  const [open, setOpen] = useState(false);

  const handleAddYouTube = () => {
    // TODO: Implement YouTube link addition
    console.log('Add YouTube link');
    // Will use onAddLink in the future implementation
    if (onAddLink) {
      // Placeholder for future implementation
    }
    setOpen(false);
  };

  const handleAddLink = () => {
    // TODO: Implement general link addition
    console.log('Add general link');
    // Will use onAddLink in the future implementation
    if (onAddLink) {
      // Placeholder for future implementation
    }
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      content={
        <div className={styles.menuContent}>
          <div className={styles.menuItem} onClick={handleAddYouTube}>
            <div className={styles.menuIcon}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M21.543 6.498C22 8.28 22 12 22 12s0 3.72-.457 5.502c-.254.985-.997 1.76-1.938 2.022C17.896 20 12 20 12 20s-5.893 0-7.605-.476c-.945-.266-1.687-1.04-1.938-2.022C2 15.72 2 12 2 12s0-3.72.457-5.502c.254-.985.997-1.76 1.938-2.022C6.107 4 12 4 12 4s5.896 0 7.605.476c.945.266 1.687 1.04 1.938 2.022zM10 15.5l6-3.5-6-3.5v7z" />
              </svg>
            </div>
            <div className={styles.menuItemContent}>
              <div className={styles.menuItemTitle}>YouTube</div>
              <div className={styles.menuItemDescription}>
                Add a YouTube video link
              </div>
            </div>
          </div>
          <div className={styles.menuItem} onClick={handleAddLink}>
            <LinkIcon className={styles.menuIcon} />
            <div className={styles.menuItemContent}>
              <div className={styles.menuItemTitle}>Links</div>
              <div className={styles.menuItemDescription}>
                Add a general web link
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
        tooltip={t['Add Link']?.() || '添加链接'}
        tooltipOptions={sideBottom}
        data-testid="sidebar-add-link-button"
        style={style}
        className={clsx([styles.root, className])}
        size={16}
      >
        <LinkIcon />
      </IconButton>
    </Popover>
  );
}
