import { FlexWrapper } from '@affine/component';
import { EmptyCollectionDetail } from '@affine/core/components/affine/empty/collection-detail';
import {
  createDocExplorerContext,
  DocExplorerContext,
} from '@affine/core/components/explorer/context';
import type { ExplorerDisplayPreference } from '@affine/core/components/explorer/types';
import { useGuard } from '@affine/core/components/guard';
import { PodcastsExplorer } from '@affine/core/components/learnify/podcasts/explorer/podcasts-list';
import {
  type Collection,
  CollectionService,
} from '@affine/core/modules/collection';
import { CollectionRulesService } from '@affine/core/modules/collection-rules';
import { GlobalContextService } from '@affine/core/modules/global-context';
import { WorkspacePermissionService } from '@affine/core/modules/permissions';
import { WorkspaceService } from '@affine/core/modules/workspace';
import { useI18n } from '@affine/i18n';
import { ViewLayersIcon } from '@blocksuite/icons/rc';
import { useLiveData, useService, useServices } from '@toeverything/infra';
import { useCallback, useEffect, useState } from 'react';

import { useNavigateHelper } from '../../../../../components/hooks/use-navigate-helper';
import {
  useIsActiveView,
  ViewBody,
  ViewHeader,
  ViewIcon,
  ViewTitle,
} from '../../../../../modules/workbench';
import { PageNotFound } from '../../../404';
import { DetailPageWrapper } from '../../../workspace/detail-page/detail-page-wrapper';
import { AllDocSidebarTabs } from '../../../workspace/layouts/all-doc-sidebar-tabs';
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

  const handleEditorLoad = useCallback(() => {
    // 播放器加载完成后的回调
    console.log('Player loaded for podcasts');
  }, []);

  // 监听选中的文档ID变化
  const selectedDocIds = useLiveData(explorerContextValue.selectedDocIds$);

  useEffect(() => {
    // 当有文档被选中时，设置第一个选中的文档为编辑器显示的文档
    console.log('Selected doc IDs changed:', selectedDocIds);
    if (selectedDocIds.length > 0) {
      const newSelectedDocId = selectedDocIds[0];
      console.log('Setting selected doc ID to:', newSelectedDocId);
      setSelectedDocId(newSelectedDocId);
    } else {
      // 如果没有选中的文档，清除当前选择
      setSelectedDocId(null);
    }
  }, [selectedDocIds]);

  // 检查文档访问权限
  const canAccess = useGuard('Doc_Read', selectedDocId ?? '');

  // 添加调试信息
  useEffect(() => {
    if (selectedDocId) {
      console.log('Selected document:', selectedDocId);
      console.log('Can access document:', canAccess);
    }
  }, [selectedDocId, canAccess]);

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
    groupBy,
    orderBy,
    rules.filters,
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
    // TODO 改为更正式的方案
    collectionService.collection$('rSgD3v_qUdHm-K5AKcyq7')
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
      <Placeholder collection={collection} />
    ) : (
      <CollectionDetail collection={collection} />
    );

  return (
    <>
      <ViewIcon icon="collection" />
      <ViewTitle title={name ?? t['Untitled']()} />
      <AllDocSidebarTabs />
      {inner}
    </>
  );
};

const Placeholder = ({ collection }: { collection: Collection }) => {
  const workspace = useService(WorkspaceService).workspace;
  const { jumpToCollections } = useNavigateHelper();
  const t = useI18n();
  const name = useLiveData(collection?.name$);

  const handleJumpToCollections = useCallback(() => {
    jumpToCollections(workspace.id);
  }, [jumpToCollections, workspace]);

  return (
    <>
      <ViewHeader>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 'var(--affine-font-xs)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              color: 'var(--affine-text-secondary-color)',
              ['WebkitAppRegion' as string]: 'no-drag',
            }}
            onClick={handleJumpToCollections}
          >
            <ViewLayersIcon
              style={{ color: 'var(--affine-icon-color)' }}
              fontSize={14}
            />
            {t['com.affine.collection.allCollections']()}
            <div>/</div>
          </div>
          <div
            data-testid="collection-name"
            style={{
              fontWeight: 600,
              color: 'var(--affine-text-primary-color)',
              ['WebkitAppRegion' as string]: 'no-drag',
            }}
          >
            {name ?? t['Untitled']()}
          </div>
          <div style={{ flex: 1 }} />
        </div>
      </ViewHeader>
      <ViewBody>
        <EmptyCollectionDetail
          collection={collection}
          style={{ height: '100%' }}
        />
      </ViewBody>
    </>
  );
};
