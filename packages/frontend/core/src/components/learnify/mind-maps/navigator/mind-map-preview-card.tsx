import type { Collection } from '@affine/core/modules/collection';
import { CollectionRulesService } from '@affine/core/modules/collection-rules';
import { DocsService } from '@affine/core/modules/doc';
import { EditorsService } from '@affine/core/modules/editor';
import { FrameworkScope, useLiveData, useService } from '@toeverything/infra';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { BlockSuiteEditor } from '../../../../blocksuite/block-suite-editor';
import * as styles from './mind-map-preview-card.css.ts';

export const MindMapPreviewCard = ({
  collection,
}: {
  collection: Collection;
}) => {
  const collectionRulesService = useService(CollectionRulesService);
  const docsService = useService(DocsService);
  const [firstDocId, setFirstDocId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          // Get first document
          const docs = result.groups.flatMap(group => group.items);
          if (docs.length > 0) {
            setFirstDocId(docs[0]);
          }
          setIsLoading(false);
        },
        error: error => {
          console.error('Failed to load mind map preview:', error);
          setIsLoading(false);
        },
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [collection, collectionRulesService]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Loading mind map...</div>
      </div>
    );
  }

  if (!firstDocId) {
    return (
      <div className={styles.emptyPreview}>
        <div className={styles.emptyText}>No mind maps yet</div>
        <div className={styles.emptySubtext}>
          Create your first mind map to get started
        </div>
      </div>
    );
  }

  return <MindMapDocumentPreview docId={firstDocId} />;
};

const MindMapDocumentPreview = ({ docId }: { docId: string }) => {
  const docsService = useService(DocsService);
  const { doc, release } = useMemo(
    () => docsService.open(docId),
    [docsService, docId]
  );
  const docRecord = useLiveData(docsService.list.doc$(docId));
  const title = useLiveData(docRecord?.title$);

  const editor = useMemo(() => {
    const editorsService = doc.scope.get(EditorsService);
    const editor = editorsService.createEditor();
    editor.setMode('edgeless');
    editor.doc.readonly = true;
    return editor;
  }, [doc.scope]);

  useEffect(() => {
    return () => {
      editor.dispose();
      release();
    };
  }, [editor, release]);

  const onLoad = useCallback(
    (editorContainer: any) => {
      const unbind = editor.bindEditorContainer(editorContainer);

      return () => {
        unbind();
      };
    },
    [editor]
  );

  useEffect(() => {
    doc.blockSuiteDoc.load();
  }, [doc]);

  return (
    <FrameworkScope scope={doc.scope}>
      <FrameworkScope scope={editor.scope}>
        <div className={styles.previewContainer}>
          <div className={styles.previewWindow}>
            <div className={styles.editorContainer}>
              <BlockSuiteEditor
                className={styles.editor}
                mode="edgeless"
                page={doc.blockSuiteDoc}
                onEditorReady={onLoad}
                readonly
              />
            </div>
          </div>
        </div>
      </FrameworkScope>
    </FrameworkScope>
  );
};
