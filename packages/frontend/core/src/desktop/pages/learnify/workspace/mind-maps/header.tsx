import { Button, FlexWrapper } from '@affine/component';
import { usePageHelper } from '@affine/core/blocksuite/block-suite-page-list/utils';
import { ExplorerDisplayMenuButton } from '@affine/core/components/explorer/display-menu';
import { ExplorerNavigation } from '@affine/core/components/explorer/header/navigation';
import type { ExplorerDisplayPreference } from '@affine/core/components/explorer/types';
import { Header } from '@affine/core/components/pure/header';
import { LEARNIFY_COLLECTIONS } from '@affine/core/constants/learnify-collections';
import { CollectionService } from '@affine/core/modules/collection';
import type { DocRecord } from '@affine/core/modules/doc';
import { WorkbenchService } from '@affine/core/modules/workbench';
import { WorkspaceService } from '@affine/core/modules/workspace';
import { useI18n } from '@affine/i18n';
import { PlusIcon } from '@blocksuite/icons/rc';
import { useServices } from '@toeverything/infra';
import { useCallback } from 'react';

export const MindMapsHeader = ({
  displayPreference,
  onDisplayPreferenceChange,
}: {
  displayPreference: ExplorerDisplayPreference;
  onDisplayPreferenceChange: (
     
    displayPreference: ExplorerDisplayPreference
  ) => void;
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
  const { createEdgeless } = usePageHelper(workspace.docCollection);

  const createAndAddDocument = useCallback(
    (createDocumentFn: () => DocRecord) => {
      const newDoc = createDocumentFn();
      collectionService.addDocToCollection(
        LEARNIFY_COLLECTIONS.MIND_MAPS,
        newDoc.id
      );
      return newDoc;
    },
    [collectionService]
  );

  const onCreateEdgeless = useCallback(() => {
    const newDoc = createAndAddDocument(createEdgeless);
    workbench.openDoc(newDoc.id);
  }, [createEdgeless, createAndAddDocument, workbench]);

  return (
    <Header
      right={
        <FlexWrapper gap={16}>
          <Button
            size="default"
            prefix={<PlusIcon />}
            onClick={onCreateEdgeless}
          >
            {t['New Mind Map']?.() || 'New Mind Map'}
          </Button>
          <ExplorerDisplayMenuButton
            displayPreference={displayPreference}
            onDisplayPreferenceChange={onDisplayPreferenceChange}
          />
        </FlexWrapper>
      }
      left={<ExplorerNavigation active="mind-maps" />}
    />
  );
};
