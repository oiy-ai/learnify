import { Button, FlexWrapper } from '@affine/component';
import {
  createDocExplorerContext,
  DocExplorerContext,
} from '@affine/core/components/explorer/context';
import type { ExplorerDisplayPreference } from '@affine/core/components/explorer/types';
import { useGuard } from '@affine/core/components/guard';
import { EmptyMindMapDetail } from '@affine/core/components/learnify/empty/mind-map-detail';
import { MindMapsExplorer } from '@affine/core/components/learnify/mind-maps/explorer/mind-maps-list';
import { PageDetailEditor } from '@affine/core/components/page-detail-editor';
import { LEARNIFY_COLLECTIONS } from '@affine/core/constants/learnify-collections';
import { CollectionListHeader } from '@affine/core/desktop/pages/workspace/collection/list-header';
import { UserFeatureService } from '@affine/core/modules/cloud';
import {
  type Collection,
  CollectionService,
} from '@affine/core/modules/collection';
import { CollectionRulesService } from '@affine/core/modules/collection-rules';
import { EditorService } from '@affine/core/modules/editor';
import { GlobalContextService } from '@affine/core/modules/global-context';
import { WorkspacePermissionService } from '@affine/core/modules/permissions';
import { WorkspaceService } from '@affine/core/modules/workspace';
import { useI18n } from '@affine/i18n';
import { EditIcon } from '@blocksuite/icons/rc';
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
import { MindMapsHeader } from './header';
import * as styles from './index.css';
import { ZoomToolbarWrapper } from './zoom-toolbar-wrapper';

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
    // 编辑器加载完成后的回调
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

  const userFeatureService = useService(UserFeatureService);
  const isAFFiNEAdmin = useLiveData(userFeatureService.userFeature.isAdmin$);

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

  useEffect(() => {
    userFeatureService.userFeature.revalidate();
  }, [userFeatureService]);

  return (
    <DocExplorerContext.Provider value={explorerContextValue}>
      <ViewHeader>
        <MindMapsHeader
          displayPreference={displayPreference}
          onDisplayPreferenceChange={handleDisplayPreferenceChange}
        />
      </ViewHeader>
      <ViewBody>
        <FlexWrapper flexDirection="column" alignItems="stretch" width="33%">
          {isAFFiNEAdmin ? (
            <CollectionListHeader collection={collection} />
          ) : null}
          <div className={styles.scrollArea}>
            <MindMapsExplorer disableMultiDelete={!isAdmin && !isOwner} />
          </div>
        </FlexWrapper>
        <FlexWrapper
          flexDirection="column"
          alignItems="stretch"
          width="67%"
          className={styles.rightPanel}
        >
          {selectedDocId ? (
            <DetailPageWrapper
              pageId={selectedDocId}
              canAccess={canAccess}
              skeleton={
                <div className={styles.editorPlaceholder}>加载中...</div>
              }
              notFound={
                <div className={styles.editorPlaceholder}>
                  文档未找到或无权限访问
                </div>
              }
            >
              <MindMapEditorWrapper onLoad={handleEditorLoad} />
            </DetailPageWrapper>
          ) : (
            <div className={styles.editorPlaceholder}>
              <div className={styles.placeholderContent}>
                <div className={styles.placeholderText}>
                  请选择一个文档来查看
                </div>
              </div>
            </div>
          )}
        </FlexWrapper>
      </ViewBody>
    </DocExplorerContext.Provider>
  );
};

// Mind-maps 专用的编辑器包装器，强制使用 edgeless 模式
const MindMapEditorWrapper = ({ onLoad }: { onLoad: () => void }) => {
  const editorService = useService(EditorService);
  const editor = editorService.editor;
  const workspace = useService(WorkspaceService).workspace;
  const { jumpToPage } = useNavigateHelper();
  const currentDocId = editor.doc.id;

  useEffect(() => {
    // 强制设置为 edgeless 模式
    const currentMode = editor.mode$.value;
    if (currentMode !== 'edgeless') {
      editor.setMode('edgeless');
    }
  }, [editor]);

  const handleEditorLoad = useCallback(
    (editorContainer: any) => {
      // 绑定编辑器容器到 EditorService
      const unbind = editor.bindEditorContainer(editorContainer);

      // 调用原始的 onLoad 回调
      onLoad();

      // 返回清理函数
      return () => {
        unbind();
      };
    },
    [editor, onLoad]
  );

  const handleEditClick = useCallback(() => {
    if (currentDocId) {
      jumpToPage(workspace.id, currentDocId);
    }
  }, [currentDocId, jumpToPage, workspace.id]);

  return (
    <div className={styles.mindMapEditorWrapper}>
      <PageDetailEditor onLoad={handleEditorLoad} readonly />
      <div className={styles.zoomToolbar}>
        <ZoomToolbarWrapper />
      </div>
      <div className={styles.editButton}>
        <Button size="default" prefix={<EditIcon />} onClick={handleEditClick}>
          编辑
        </Button>
      </div>
    </div>
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
    collectionService.collection$(LEARNIFY_COLLECTIONS.MIND_MAPS)
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
      {inner}
    </>
  );
};

const Placeholder = ({ collection }: { collection: Collection }) => {
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
        <MindMapsHeader
          displayPreference={displayPreference}
          onDisplayPreferenceChange={handleDisplayPreferenceChange}
        />
      </ViewHeader>
      <ViewBody>
        <EmptyMindMapDetail
          collection={collection}
          style={{ height: '100%' }}
        />
      </ViewBody>
    </>
  );
};
