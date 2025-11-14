import { useAsyncCallback } from '@affine/core/components/hooks/affine-async-hooks';
import { LEARNIFY_COLLECTIONS } from '@affine/core/constants/learnify-collections';
import { CollectionService } from '@affine/core/modules/collection';
import { DocsService } from '@affine/core/modules/doc';
import { GlobalContextService } from '@affine/core/modules/global-context';
import { WorkspaceService } from '@affine/core/modules/workspace';
import { useService } from '@toeverything/infra';
import { useCallback } from 'react';

import { useNavigateHelper } from '../use-navigate-helper';

export function useBlockSuiteMetaHelper() {
  const workspace = useService(WorkspaceService).workspace;
  const globalContext = useService(GlobalContextService).globalContext;
  const collectionService = useService(CollectionService);
  const { openPage } = useNavigateHelper();
  const docsService = useService(DocsService);
  const docRecordList = docsService.list;

  // TODO-Doma
  // "Remove" may cause ambiguity here. Consider renaming as "moveToTrash".
  const removeToTrash = useCallback(
    (docId: string) => {
      const docRecord = docRecordList.doc$(docId).value;
      if (docRecord) {
        docRecord.moveToTrash();
      }
    },
    [docRecordList]
  );

  const restoreFromTrash = useCallback(
    (docId: string) => {
      const docRecord = docRecordList.doc$(docId).value;
      if (docRecord) {
        docRecord.restoreFromTrash();
      }
    },
    [docRecordList]
  );

  const permanentlyDeletePage = useCallback(
    (pageId: string) => {
      workspace.docCollection.removeDoc(pageId);
    },
    [workspace]
  );

  const duplicate = useAsyncCallback(
    async (pageId: string, openPageAfterDuplication: boolean = true) => {
      const newPageId = await docsService.duplicate(pageId);
      if (globalContext.collectionId.get() === LEARNIFY_COLLECTIONS.NOTES) {
        collectionService.addDocToCollection(
          LEARNIFY_COLLECTIONS.NOTES,
          newPageId
        );
      }
      openPageAfterDuplication &&
        openPage(workspace.docCollection.id, newPageId);
    },
    [
      collectionService,
      docsService,
      globalContext,
      openPage,
      workspace.docCollection.id,
    ]
  );

  return {
    removeToTrash,
    restoreFromTrash,
    permanentlyDeletePage,

    duplicate,
  };
}
