import type { Collection } from '@affine/core/modules/collection';
import { CollectionRulesService } from '@affine/core/modules/collection-rules';
import { DocsService } from '@affine/core/modules/doc';
import { DocsSearchService } from '@affine/core/modules/docs-search';
import { WorkbenchService } from '@affine/core/modules/workbench';
import { LiveData, useLiveData, useService } from '@toeverything/infra';
import { useCallback, useEffect, useMemo, useState } from 'react';

import * as styles from './note-preview-card.css';

interface NotePreviewItemProps {
  docId: string;
  onClick: () => void;
}

const NotePreviewItem = ({ docId, onClick }: NotePreviewItemProps) => {
  const docsService = useService(DocsService);
  const docsSearchService = useService(DocsSearchService);
  const docRecord = useLiveData(docsService.list.doc$(docId));
  const title = useLiveData(docRecord?.title$);
  const updatedAt = useLiveData(docRecord?.updatedAt$);

  const summary = useLiveData(
    useMemo(
      () => LiveData.from(docsSearchService.watchDocSummary(docId), null),
      [docsSearchService, docId]
    )
  );

  useEffect(() => {
    const undo = docsSearchService.indexer.addPriority(docId, 100);
    return undo;
  }, [docsSearchService, docId]);

  const getDescription = () => {
    if (summary && summary !== '') {
      // Limit summary to 80 characters
      return summary.length > 80 ? summary.substring(0, 77) + '...' : summary;
    }
    return 'No description available';
  };

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <div className={styles.noteItem} onClick={onClick}>
      <div className={styles.noteTitleRow}>
        <div className={styles.noteTitle}>{title || 'Untitled'}</div>
        <div className={styles.noteTime}>{formatDate(updatedAt)}</div>
      </div>
      <div className={styles.noteDescription}>{getDescription()}</div>
    </div>
  );
};

export const NotePreviewCard = ({ collection }: { collection: Collection }) => {
  const collectionRulesService = useService(CollectionRulesService);
  const workbench = useService(WorkbenchService).workbench;
  const [previewDocs, setPreviewDocs] = useState<string[]>([]);

  useEffect(() => {
    const rules = collection.rules$.value;
    const allowList = collection.allowList$.value;

    const subscription = collectionRulesService
      .watch({
        filters: rules.filters,
        orderBy: { key: 'updatedDate', method: 'desc' },
        extraAllowList: allowList,
        extraFilters: [
          {
            type: 'system',
            key: 'empty-journal',
            method: 'is',
            value: 'false',
          },
          {
            type: 'system',
            key: 'trash',
            method: 'is',
            value: 'false',
          },
        ],
      })
      .subscribe({
        next: result => {
          // Get first 3 documents
          const docs = result.groups.flatMap(group => group.items).slice(0, 3);
          setPreviewDocs(docs);
        },
        error: error => {
          console.error('Failed to load notes preview:', error);
        },
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [collection, collectionRulesService]);

  const handleNoteClick = useCallback(
    (docId: string) => {
      workbench.openDoc(docId);
    },
    [workbench]
  );

  if (previewDocs.length === 0) {
    return (
      <div className={styles.emptyPreview}>
        <div className={styles.emptyText}>No notes yet</div>
        <div className={styles.emptySubtext}>
          Create your first note to get started
        </div>
      </div>
    );
  }

  return (
    <div className={styles.previewContainer}>
      <div className={styles.notesList}>
        {previewDocs.map(docId => (
          <NotePreviewItem
            key={docId}
            docId={docId}
            onClick={() => handleNoteClick(docId)}
          />
        ))}
      </div>
    </div>
  );
};
