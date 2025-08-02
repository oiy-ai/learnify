import { Button } from '@affine/component';
import { LEARNIFY_COLLECTIONS } from '@affine/core/constants/learnify-collections';
import { CollectionService } from '@affine/core/modules/collection';
import { WorkbenchService } from '@affine/core/modules/workbench';
import { FlashPanelIcon } from '@blocksuite/icons/rc';
import { useLiveData, useService } from '@toeverything/infra';
import { useTheme } from 'next-themes';
import { useCallback } from 'react';

import { FlashcardPreviewCard } from './flashcard-preview-card';
import * as styles from './index.css';

export const FlashcardsNavigator = () => {
  const { resolvedTheme } = useTheme();
  const workbench = useService(WorkbenchService).workbench;
  const collectionService = useService(CollectionService);
  const collection = useLiveData(
    collectionService.collection$(LEARNIFY_COLLECTIONS.FLASHCARDS)
  );

  const handleNavigateToFlashcards = useCallback(() => {
    workbench.openFlashcards();
  }, [workbench]);

  return (
    <div className={styles.container}>
      <div className={styles.root} data-theme={resolvedTheme}>
        {collection ? (
          <FlashcardPreviewCard collection={collection} />
        ) : (
          <div className={styles.loadingContainer}>Loading...</div>
        )}
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
