import { Button } from '@affine/component';
import { WorkbenchService } from '@affine/core/modules/workbench';
import { FlashPanelIcon } from '@blocksuite/icons/rc';
import { useService } from '@toeverything/infra';
import { useTheme } from 'next-themes';
import { useCallback } from 'react';

import demoImage from './demo.png';
import * as styles from './index.css';

export const FlashcardsNavigator = () => {
  const { resolvedTheme } = useTheme();
  const workbench = useService(WorkbenchService).workbench;

  const handleNavigateToFlashcards = useCallback(() => {
    workbench.openFlashcards();
  }, [workbench]);

  return (
    <div className={styles.container}>
      <div className={styles.root} data-theme={resolvedTheme}>
        <img
          src={demoImage}
          alt="Flashcards Navigator"
          className={styles.image}
        />
      </div>
      <Button
        className={styles.floatingButton}
        onClick={handleNavigateToFlashcards}
        prefix={<FlashPanelIcon />}
      >
        Go to Flashcards
      </Button>
    </div>
  );
};
