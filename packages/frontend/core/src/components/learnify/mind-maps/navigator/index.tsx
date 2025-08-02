import { Button } from '@affine/component';
import { LEARNIFY_COLLECTIONS } from '@affine/core/constants/learnify-collections';
import { CollectionService } from '@affine/core/modules/collection';
import { WorkbenchService } from '@affine/core/modules/workbench';
import { MindmapIcon } from '@blocksuite/icons/rc';
import { useLiveData, useService } from '@toeverything/infra';
import { useTheme } from 'next-themes';
import { useCallback } from 'react';

import * as styles from './index.css';
import { MindMapPreviewCard } from './mind-map-preview-card';

export const MindMapsNavigator = () => {
  const { resolvedTheme } = useTheme();
  const workbench = useService(WorkbenchService).workbench;
  const collectionService = useService(CollectionService);
  const collection = useLiveData(
    collectionService.collection$(LEARNIFY_COLLECTIONS.MIND_MAPS)
  );

  const handleNavigateToMindMaps = useCallback(() => {
    workbench.openMindMaps();
  }, [workbench]);

  return (
    <div className={styles.container}>
      <div className={styles.root} data-theme={resolvedTheme}>
        {collection ? (
          <MindMapPreviewCard collection={collection} />
        ) : (
          <div className={styles.loadingContainer}>Loading...</div>
        )}
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
