import { EdgelessIcon, PageIcon } from '@blocksuite/icons/rc';
import clsx from 'clsx';
import type { HTMLAttributes } from 'react';

import type { EdgelessSwitchMode } from '../types';
import * as styles from './style.css';

interface EdgelessSwitchProps extends HTMLAttributes<HTMLDivElement> {
  mode: EdgelessSwitchMode;
  onSwitchToPageMode: () => void;
  onSwitchToEdgelessMode: () => void;
}

export const EdgelessSwitchButtons = ({
  mode,
  className,
  onSwitchToPageMode,
  onSwitchToEdgelessMode,
  ...attrs
}: EdgelessSwitchProps) => {
  return (
    <div
      data-mode={mode}
      className={clsx(styles.switchButtons, className)}
      {...attrs}
    >
      <div
        className={styles.switchButton}
        data-active={mode === 'page'}
        onClick={onSwitchToPageMode}
      >
        <PageIcon />
      </div>
      <div
        className={styles.switchButton}
        data-active={mode === 'edgeless'}
        onClick={onSwitchToEdgelessMode}
      >
        <EdgelessIcon />
      </div>
    </div>
  );
};
