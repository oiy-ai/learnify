import { Button } from '@affine/component';
import { WorkbenchService } from '@affine/core/modules/workbench';
import { PageIcon } from '@blocksuite/icons/rc';
import { useService } from '@toeverything/infra';
import { useTheme } from 'next-themes';
import { useCallback } from 'react';

import demoImage from './demo.png';
import * as styles from './index.css';

export const NotesNavigator = () => {
  const { resolvedTheme } = useTheme();
  const workbench = useService(WorkbenchService).workbench;

  const handleNavigateToNotes = useCallback(() => {
    workbench.openNotes();
  }, [workbench]);

  return (
    <div className={styles.container}>
      <div className={styles.root} data-theme={resolvedTheme}>
        <img src={demoImage} alt="Notes Navigator" className={styles.image} />
      </div>
      <Button
        className={styles.floatingButton}
        onClick={handleNavigateToNotes}
        prefix={<PageIcon />}
      >
        Go to Notes
      </Button>
    </div>
  );
};
