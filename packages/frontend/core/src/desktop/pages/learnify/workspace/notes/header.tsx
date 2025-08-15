import { FlexWrapper, toast } from '@affine/component';
import { usePageHelper } from '@affine/core/blocksuite/block-suite-page-list/utils';
import { getStoreManager } from '@affine/core/blocksuite/manager/store';
import { ExplorerDisplayMenuButton } from '@affine/core/components/explorer/display-menu';
import { ViewToggle } from '@affine/core/components/explorer/display-menu/view-toggle';
import type { DocListItemView } from '@affine/core/components/explorer/docs-view/doc-list-item';
import { ExplorerNavigation } from '@affine/core/components/explorer/header/navigation';
import type { ExplorerDisplayPreference } from '@affine/core/components/explorer/types';
import { PageListNewPageButton } from '@affine/core/components/page-list';
import { Header } from '@affine/core/components/pure/header';
import { LEARNIFY_COLLECTIONS } from '@affine/core/constants/learnify-collections';
import { CollectionService } from '@affine/core/modules/collection';
import type { DocRecord } from '@affine/core/modules/doc';
import { WorkbenchService } from '@affine/core/modules/workbench';
import {
  getAFFiNEWorkspaceSchema,
  WorkspaceService,
} from '@affine/core/modules/workspace';
import { useI18n } from '@affine/i18n';
import type { DocMode } from '@blocksuite/affine/model';
import { useServices } from '@toeverything/infra';
import { useCallback } from 'react';

export const NotesHeader = ({
  displayPreference,
  onDisplayPreferenceChange,
  view,
  onViewChange,
}: {
  displayPreference: ExplorerDisplayPreference;
  onDisplayPreferenceChange: (
    displayPreference: ExplorerDisplayPreference
  ) => void;
  view: DocListItemView;
  onViewChange: (view: DocListItemView) => void;
}) => {
  const t = useI18n();
  const { collectionService, workspaceService, workbenchService } = useServices(
    {
      CollectionService,
      WorkspaceService,
      WorkbenchService,
    }
  );

  const workspace = workspaceService.workspace;
  const workbench = workbenchService.workbench;
  const { createEdgeless, createPage } = usePageHelper(workspace.docCollection);

  const createAndAddDocument = useCallback(
    (createDocumentFn: () => DocRecord) => {
      const newDoc = createDocumentFn();
      collectionService.addDocToCollection(
        LEARNIFY_COLLECTIONS.NOTES,
        newDoc.id
      );
      return newDoc;
    },
    [collectionService]
  );

  const createPageModeDoc = useCallback(
    () => createPage('page' as DocMode),
    [createPage]
  );

  const onCreateEdgeless = useCallback(() => {
    createAndAddDocument(createEdgeless);
  }, [createEdgeless, createAndAddDocument]);

  const onCreatePage = useCallback(() => {
    createAndAddDocument(createPageModeDoc);
  }, [createPageModeDoc, createAndAddDocument]);

  const onCreateDoc = useCallback(() => {
    createAndAddDocument(createPage);
  }, [createPage, createAndAddDocument]);

  const onImportFile = useCallback(() => {
    (async () => {
      const { showImportModal } = await import(
        '@blocksuite/affine/widgets/linked-doc'
      );

      showImportModal({
        collection: workspace.docCollection,
        schema: getAFFiNEWorkspaceSchema(),
        extensions: getStoreManager().config.init().value.get('store'),
        onSuccess: (pageIds: string[], options) => {
          toast(
            `Successfully imported ${options.importedCount} Page${
              options.importedCount > 1 ? 's' : ''
            }.`
          );

          // Add all imported pages to the NOTES collection
          pageIds.forEach(pageId => {
            collectionService.addDocToCollection(
              LEARNIFY_COLLECTIONS.NOTES,
              pageId
            );
          });

          if (options.isWorkspaceFile) {
            workbench.openAll();
            return;
          }

          if (pageIds.length > 0) {
            workbench.openDoc(pageIds[0]);
          }
        },
        onFail: (message: string) => {
          toast(`Failed to import: ${message}`);
        },
      });
    })().catch(error => {
      console.error('Failed to open import modal:', error);
      toast('Failed to open import dialog');
    });
  }, [collectionService, workbench, workspace.docCollection]);

  return (
    <Header
      right={
        <FlexWrapper gap={16}>
          <PageListNewPageButton
            size="small"
            data-testid="new-note-button-trigger"
            onCreateDoc={onCreateDoc}
            onCreateEdgeless={onCreateEdgeless}
            onCreatePage={onCreatePage}
            onImportFile={onImportFile}
          >
            <div>{t['New Page']()}</div>
          </PageListNewPageButton>
          <ViewToggle view={view} onViewChange={onViewChange} />
          <ExplorerDisplayMenuButton
            displayPreference={displayPreference}
            onDisplayPreferenceChange={onDisplayPreferenceChange}
          />
        </FlexWrapper>
      }
      left={<ExplorerNavigation active="notes" />}
    />
  );
};
