import { IconButton } from '@affine/component/ui/button';
import type { Collection } from '@affine/core/modules/collection';
import { CollectionRulesService } from '@affine/core/modules/collection-rules';
import { DocsService } from '@affine/core/modules/doc';
import { EditorsService } from '@affine/core/modules/editor';
import { MinusIcon, PlusIcon } from '@blocksuite/icons/rc';
import { FrameworkScope, useService } from '@toeverything/infra';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { BlockSuiteEditor } from '../../../../blocksuite/block-suite-editor';
import * as styles from './mind-map-preview-card.css';

export const MindMapPreviewCard = ({
  collection,
}: {
  collection: Collection;
}) => {
  const collectionRulesService = useService(CollectionRulesService);
  const [firstDocId, setFirstDocId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const rules = collection.rules$.value;
    const allowList = collection.allowList$.value;

    const subscription = collectionRulesService
      .watch({
        filters: rules.filters,
        orderBy: { type: 'updated', key: 'updatedDate', desc: true },
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

  const editor = useMemo(() => {
    const editorsService = doc.scope.get(EditorsService);
    const editor = editorsService.createEditor();
    editor.setMode('edgeless');
    editor.doc.blockSuiteDoc.readonly = true;
    return editor;
  }, [doc.scope]);

  const handleZoom = useCallback(
    (zoomIn: boolean) => {
      if (!editor.editorContainer$.value) return;

      const edgelessRoot = editor.editorContainer$.value.host?.querySelector(
        'affine-edgeless-root'
      );
      if (edgelessRoot && 'gfx' in edgelessRoot) {
        const gfx = (edgelessRoot as any).gfx;
        if (gfx?.viewport) {
          const { zoom, centerX, centerY } = gfx.viewport;
          const zoomStep = 0.1;
          const newZoom = zoomIn
            ? Math.min(zoom + zoomStep, 2.0) // Max zoom 200%
            : Math.max(zoom - zoomStep, 0.1); // Min zoom 10%

          gfx.viewport.setViewport(newZoom, [centerX, centerY]);
        }
      }
    },
    [editor.editorContainer$]
  );

  const containerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;

      let isDragging = false;
      let startX = 0;
      let startY = 0;

      const handleMouseDown = (e: MouseEvent) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        node.style.cursor = 'grabbing';
        e.preventDefault();
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || !editor.editorContainer$.value) return;

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        // Get the edgeless root element and viewport
        const edgelessRoot = editor.editorContainer$.value.host?.querySelector(
          'affine-edgeless-root'
        );
        if (edgelessRoot && 'gfx' in edgelessRoot) {
          const gfx = (edgelessRoot as any).gfx;
          if (gfx?.viewport) {
            const { zoom, centerX, centerY } = gfx.viewport;
            // Pan the viewport by the delta
            gfx.viewport.setViewport(zoom, [
              centerX - deltaX / zoom,
              centerY - deltaY / zoom,
            ]);
          }
        }

        startX = e.clientX;
        startY = e.clientY;
      };

      const handleMouseUp = () => {
        isDragging = false;
        node.style.cursor = 'grab';
      };

      node.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        node.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    },
    [editor.editorContainer$]
  );

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
        <div ref={containerRef} className={styles.previewContainer}>
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
          <div className={styles.zoomControls}>
            <IconButton
              size="20"
              onClick={() => handleZoom(false)}
              tooltip="Zoom out"
            >
              <MinusIcon />
            </IconButton>
            <IconButton
              size="20"
              onClick={() => handleZoom(true)}
              tooltip="Zoom in"
            >
              <PlusIcon />
            </IconButton>
          </div>
        </div>
      </FrameworkScope>
    </FrameworkScope>
  );
};
