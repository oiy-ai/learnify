import { Button } from '@affine/component';
import { WorkbenchService } from '@affine/core/modules/workbench';
import { MindmapIcon } from '@blocksuite/icons/rc';
import { useService } from '@toeverything/infra';
import { useTheme } from 'next-themes';
import { useCallback } from 'react';

import * as styles from './index.css';

export const MindMapsNavigator = () => {
  const { resolvedTheme } = useTheme();
  const workbench = useService(WorkbenchService).workbench;
  const lightImage =
    'https://cdn.jsdelivr.net/gh/a1exsun/file@main//hexo/20250505154900908.png';
  const darkImage =
    'https://cdn.jsdelivr.net/gh/a1exsun/file@main//hexo/20250505173403971.png';

  const handleNavigateToMindMaps = useCallback(() => {
    workbench.openMindMaps();
  }, [workbench]);

  return (
    <div className={styles.container}>
      <div className={styles.root}>
        <img
          src={resolvedTheme === 'dark' ? darkImage : lightImage}
          alt="Mind Map Navigator"
          className={styles.image}
        />
      </div>
      <Button
        className={styles.floatingButton}
        onClick={handleNavigateToMindMaps}
        prefix={<MindmapIcon />}
      >
        Go to Mind Maps
      </Button>
    </div>
  );
};
