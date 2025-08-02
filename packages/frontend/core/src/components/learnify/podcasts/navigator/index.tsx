import { Button } from '@affine/component';
import { WorkbenchService } from '@affine/core/modules/workbench';
import { HeadphonePanelIcon } from '@blocksuite/icons/rc';
import { useService } from '@toeverything/infra';
import { useTheme } from 'next-themes';
import { useCallback } from 'react';

import demoImage from './demo.png';
import * as styles from './index.css';

export const PodcastsNavigator = () => {
  const { resolvedTheme } = useTheme();
  const workbench = useService(WorkbenchService).workbench;

  const handleNavigateToPodcasts = useCallback(() => {
    workbench.openPodcasts();
  }, [workbench]);

  return (
    <div className={styles.container}>
      <div className={styles.root} data-theme={resolvedTheme}>
        <img
          src={demoImage}
          alt="Podcasts Navigator"
          className={styles.image}
        />
      </div>
      <Button
        className={styles.floatingButton}
        onClick={handleNavigateToPodcasts}
        prefix={<HeadphonePanelIcon />}
      >
        Go to Podcasts
      </Button>
    </div>
  );
};
