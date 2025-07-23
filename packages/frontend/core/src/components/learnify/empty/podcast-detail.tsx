import { UserFeatureService } from '@affine/core/modules/cloud';
import type { Collection } from '@affine/core/modules/collection';
import { WorkspaceDialogService } from '@affine/core/modules/dialogs';
import { useI18n } from '@affine/i18n';
import { AllDocsIcon } from '@blocksuite/icons/rc';
import { useLiveData, useService } from '@toeverything/infra';
import { useCallback, useEffect } from 'react';

import { ActionButton } from '../../affine/empty/action-button';
import collectionDetailDark from '../../affine/empty/assets/collection-detail.dark.png';
import collectionDetailLight from '../../affine/empty/assets/collection-detail.light.png';
import { EmptyLayout } from '../../affine/empty/layout';
import { actionGroup } from '../../affine/empty/style.css';
import type { UniversalEmptyProps } from '../../affine/empty/types';

export interface EmptyPodcastDetailProps extends UniversalEmptyProps {
  collection: Collection;
}

export const EmptyPodcastDetail = ({
  collection,
  ...props
}: EmptyPodcastDetailProps) => {
  const t = useI18n();

  return (
    <EmptyLayout
      illustrationLight={collectionDetailLight}
      illustrationDark={collectionDetailDark}
      title={t['com.learnify.empty.podcast-detail.title']()}
      description={t['com.learnify.empty.podcast-detail.description']()}
      action={
        BUILD_CONFIG.isMobileEdition ? null : (
          <Actions collection={collection} />
        )
      }
      {...props}
    />
  );
};

const Actions = ({ collection }: { collection: Collection }) => {
  const t = useI18n();
  const workspaceDialogService = useService(WorkspaceDialogService);
  const userFeatureService = useService(UserFeatureService);
  const isAFFiNEAdmin = useLiveData(userFeatureService.userFeature.isAdmin$);

  useEffect(() => {
    userFeatureService.userFeature.revalidate();
  }, [userFeatureService]);

  const openAddDocs = useCallback(() => {
    workspaceDialogService.open('collection-editor', {
      collectionId: collection.id,
      mode: 'page',
    });
  }, [collection, workspaceDialogService]);

  // const openAddRules = useCallback(() => {
  //   workspaceDialogService.open('collection-editor', {
  //     collectionId: collection.id,
  //     mode: 'rule',
  //   });
  // }, [collection, workspaceDialogService]);

  return (
    <div className={actionGroup}>
      {isAFFiNEAdmin && (
        <ActionButton prefix={<AllDocsIcon />} onClick={openAddDocs}>
          {t['com.affine.empty.collection-detail.action.add-doc']()}
        </ActionButton>
      )}

      {/* <ActionButton prefix={<FilterIcon />} onClick={openAddRules}>
        {t['com.affine.empty.collection-detail.action.add-rule']()}
      </ActionButton> */}
    </div>
  );
};
