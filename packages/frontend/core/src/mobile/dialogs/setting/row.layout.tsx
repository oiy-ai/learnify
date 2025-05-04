import { ConfigModal } from '@affine/core/components/mobile';
import { DualLinkIcon } from '@blocksuite/icons/rc';
import type { PropsWithChildren, ReactNode } from 'react';

import * as styles from './style.css';

export const RowLayout = ({
  label,
  children,
  href,
  onClick,
}: PropsWithChildren<{
  label: ReactNode;
  href?: string;
  onClick?: () => void;
}>) => {
  const content = (
    <ConfigModal.Row
      data-testid="setting-row"
      className={styles.baseSettingItem}
      onClick={onClick}
    >
      <div className={styles.baseSettingItemName}>{label}</div>
      <div className={styles.baseSettingItemAction}>
        {children ||
          (href ? <DualLinkIcon className={styles.linkIcon} /> : null)}
      </div>
    </ConfigModal.Row>
  );

  return href ? (
    <a target="_blank" href={href} rel="noreferrer">
      {content}
    </a>
  ) : (
    content
  );
};
