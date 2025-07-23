import { FlexWrapper } from '@affine/component';
import {
  createDocExplorerContext,
  DocExplorerContext,
} from '@affine/core/components/explorer/context';
import type { ExplorerDisplayPreference } from '@affine/core/components/explorer/types';
import { useGuard } from '@affine/core/components/guard';
import { EmptyPodcastDetail } from '@affine/core/components/learnify/empty/podcast-detail';
import { PodcastsExplorer } from '@affine/core/components/learnify/podcasts/explorer/podcasts-list';
import { LEARNIFY_COLLECTIONS } from '@affine/core/constants/learnify-collections';
import {
  type Collection,
  CollectionService,
} from '@affine/core/modules/collection';
import { CollectionRulesService } from '@affine/core/modules/collection-rules';
import { GlobalContextService } from '@affine/core/modules/global-context';
import { WorkspacePermissionService } from '@affine/core/modules/permissions';
import { useI18n } from '@affine/i18n';
import { useLiveData, useService, useServices } from '@toeverything/infra';
import { useCallback, useEffect, useState } from 'react';

import {
  useIsActiveView,
  ViewBody,
  ViewHeader,
  ViewIcon,
  ViewTitle,
} from '../../../../../modules/workbench';
import { PageNotFound } from '../../../404';
import { DetailPageWrapper } from '../../../workspace/detail-page/detail-page-wrapper';
import { PodcastsHeader } from './header';
import * as styles from './index.css';
import { PlayerWrapper } from './player-wrapper';

export const CollectionDetail = ({
  collection,
}: {
  collection: Collection;
}) => {
  const [explorerContextValue] = useState(() =>
    createDocExplorerContext({
      view: 'list',
      displayProperties: ['system:updatedAt', 'system:updatedBy'],
      showDocIcon: true,
      showDocPreview: false,
    })
  );
  const collectionRulesService = useService(CollectionRulesService);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  const handleEditorLoad = useCallback(() => {
    // 播放器加载完成后的回调
  }, []);

  // 监听选中的文档ID变化
  const selectedDocIds = useLiveData(explorerContextValue.selectedDocIds$);

  useEffect(() => {
    // 当有文档被选中时，设置第一个选中的文档为编辑器显示的文档
    if (selectedDocIds.length > 0) {
      setSelectedDocId(selectedDocIds[0]);
    } else {
      setSelectedDocId(null);
    }
  }, [selectedDocIds]);

  // 检查文档访问权限
  const canAccess = useGuard('Doc_Read', selectedDocId ?? '');

  const permissionService = useService(WorkspacePermissionService);
  const isAdmin = useLiveData(permissionService.permission.isAdmin$);
  const isOwner = useLiveData(permissionService.permission.isOwner$);

  const displayPreference = useLiveData(
    explorerContextValue.displayPreference$
  );
  const groupBy = useLiveData(explorerContextValue.groupBy$);
  const orderBy = useLiveData(explorerContextValue.orderBy$);
  const rules = useLiveData(collection.rules$);
  const allowList = useLiveData(collection.allowList$);

  const handleDisplayPreferenceChange = useCallback(
    (displayPreference: ExplorerDisplayPreference) => {
      explorerContextValue.displayPreference$.next(displayPreference);
    },
    [explorerContextValue]
  );

  useEffect(() => {
    const subscription = collectionRulesService
      .watch({
        filters: rules.filters,
        groupBy,
        orderBy,
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
          explorerContextValue.groups$.next(result.groups);

          // Auto-select first document if none selected
          if (
            !hasAutoSelected &&
            selectedDocIds.length === 0 &&
            result.groups.length > 0
          ) {
            const firstGroup = result.groups[0];
            if (firstGroup.items && firstGroup.items.length > 0) {
              setHasAutoSelected(true);
              explorerContextValue.selectedDocIds$.next([firstGroup.items[0]]);
            }
          }
        },
        error: error => {
          console.error(error);
        },
      });
    return () => {
      subscription.unsubscribe();
    };
  }, [
    allowList,
    collectionRulesService,
    explorerContextValue.groups$,
    explorerContextValue.selectedDocIds$,
    groupBy,
    orderBy,
    rules.filters,
    selectedDocIds,
    hasAutoSelected,
  ]);

  return (
    <DocExplorerContext.Provider value={explorerContextValue}>
      <ViewHeader>
        <PodcastsHeader
          displayPreference={displayPreference}
          onDisplayPreferenceChange={handleDisplayPreferenceChange}
        />
      </ViewHeader>
      <ViewBody>
        <FlexWrapper flexDirection="column" alignItems="stretch" width="55%">
          <div className={styles.scrollArea}>
            <PodcastsExplorer disableMultiDelete={!isAdmin && !isOwner} />
          </div>
        </FlexWrapper>
        <FlexWrapper
          flexDirection="column"
          alignItems="stretch"
          width="45%"
          className={styles.rightPanel}
        >
          {selectedDocId ? (
            <DetailPageWrapper
              pageId={selectedDocId}
              canAccess={canAccess}
              skeleton={
                <div className={styles.editorPlaceholder}>播客加载中...</div>
              }
              notFound={
                <div className={styles.editorPlaceholder}>
                  播客未找到或无权限访问
                </div>
              }
            >
              <PlayerWrapper onLoad={handleEditorLoad} />
            </DetailPageWrapper>
          ) : (
            <div className={styles.editorPlaceholder}>
              <div className={styles.placeholderContent}>
                <div className={styles.placeholderText}>
                  请选择一个播客来收听
                </div>
              </div>
            </div>
          )}
        </FlexWrapper>
      </ViewBody>
    </DocExplorerContext.Provider>
  );
};

export const Component = function CollectionPage() {
  const { collectionService, globalContextService } = useServices({
    CollectionService,
    GlobalContextService,
  });
  const globalContext = globalContextService.globalContext;
  const t = useI18n();
  const collection = useLiveData(
    collectionService.collection$(LEARNIFY_COLLECTIONS.PODCASTS)
  );
  const name = useLiveData(collection?.name$);
  const isActiveView = useIsActiveView();

  useEffect(() => {
    if (isActiveView && collection) {
      globalContext.collectionId.set(collection.id);
      globalContext.isCollection.set(true);

      return () => {
        globalContext.collectionId.set(null);
        globalContext.isCollection.set(false);
      };
    }
    return;
  }, [collection, globalContext, isActiveView]);

  const info = useLiveData(collection?.info$);

  if (!collection) {
    return <PageNotFound />;
  }
  const inner =
    info?.allowList.length === 0 && info?.rules.filters.length === 0 ? (
      <Placeholder />
    ) : (
      <CollectionDetail collection={collection} />
    );

  return (
    <>
      <ViewIcon icon="collection" />
      <ViewTitle title={name ?? t['Untitled']()} />
      {inner}
    </>
  );
};

const Placeholder = () => {
  const [explorerContextValue] = useState(() =>
    createDocExplorerContext({
      view: 'list',
      displayProperties: ['system:updatedAt', 'system:updatedBy'],
      showDocIcon: true,
      showDocPreview: false,
    })
  );

  const displayPreference = useLiveData(
    explorerContextValue.displayPreference$
  );

  const handleDisplayPreferenceChange = useCallback(
    (displayPreference: ExplorerDisplayPreference) => {
      explorerContextValue.displayPreference$.next(displayPreference);
    },
    [explorerContextValue]
  );

  return (
    <>
      <ViewHeader>
        <PodcastsHeader
          displayPreference={displayPreference}
          onDisplayPreferenceChange={handleDisplayPreferenceChange}
        />
      </ViewHeader>
      <ViewBody>
        <EmptyPodcastDetail style={{ height: '100%' }} />
      </ViewBody>
    </>
  );
};
