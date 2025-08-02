import { Button } from '@affine/component';
import { LEARNIFY_COLLECTIONS } from '@affine/core/constants/learnify-collections';
import { CollectionService } from '@affine/core/modules/collection';
import { WorkbenchService } from '@affine/core/modules/workbench';
import { PageIcon } from '@blocksuite/icons/rc';
import { useLiveData, useService } from '@toeverything/infra';
import { useTheme } from 'next-themes';
import { useCallback } from 'react';

import * as styles from './index.css';
import { NotePreviewCard } from './note-preview-card';

export const NotesNavigator = () => {
  const { resolvedTheme } = useTheme();
  const workbench = useService(WorkbenchService).workbench;
  const collectionService = useService(CollectionService);
  const collection = useLiveData(
    collectionService.collection$(LEARNIFY_COLLECTIONS.NOTES)
  );

  const handleNavigateToNotes = useCallback(() => {
    workbench.openNotes();
  }, [workbench]);

  return (
    <div className={styles.container}>
      <div className={styles.root} data-theme={resolvedTheme}>
        {collection ? (
          <NotePreviewCard collection={collection} />
        ) : (
          <div className={styles.loadingContainer}>Loading...</div>
        )}
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
