import {
  Masonry,
  type MasonryGroup,
  type MasonryItem,
  useConfirmModal,
} from '@affine/component';
import { DocsService } from '@affine/core/modules/doc';
import { WorkspacePropertyService } from '@affine/core/modules/workspace-property';
import { Trans, useI18n } from '@affine/i18n';
import { useLiveData, useService } from '@toeverything/infra';
import { cssVarV2 } from '@toeverything/theme/v2';
import { memo, useCallback, useContext, useEffect, useMemo } from 'react';

import { DocExplorerContext } from '../../../explorer/context';
import { DocListItem } from '../../../explorer/docs-view/doc-list-item';
import { ListFloatingToolbar } from '../../../page-list/components/list-floating-toolbar';
import { SystemPropertyTypes } from '../../../system-property-types';
import { WorkspacePropertyTypes } from '../../../workspace-property-types';
import * as styles from './cards-list.css';

const GroupHeader = memo(function GroupHeader({
  groupId,
  collapsed,
  itemCount,
}: {
  groupId: string;
  collapsed?: boolean;
  itemCount: number;
}) {
  const contextValue = useContext(DocExplorerContext);
  const propertyService = useService(WorkspacePropertyService);
  const allProperties = useLiveData(propertyService.sortedProperties$);
  const groupBy = useLiveData(contextValue.groupBy$);

  const groupType = groupBy?.type;
  const groupKey = groupBy?.key;

  const header = useMemo(() => {
    if (groupType === 'system') {
      const property = groupKey && SystemPropertyTypes[groupKey];
      if (!property) return null;
      const GroupHeader = property.groupHeader;
      if (!GroupHeader) return null;
      return (
        <GroupHeader
          groupId={groupId}
          docCount={itemCount}
          collapsed={!!collapsed}
        />
      );
    } else if (groupType === 'property') {
      const property = allProperties.find(p => p.id === groupKey);
      if (!property) return null;

      const config = WorkspacePropertyTypes[property.type];
      if (!config?.groupHeader) return null;
      return (
        <config.groupHeader
          groupId={groupId}
          docCount={itemCount}
          collapsed={!!collapsed}
        />
      );
    } else {
      console.warn('unsupported group type', groupType);
      return null;
    }
  }, [allProperties, collapsed, groupId, groupKey, groupType, itemCount]);

  if (!groupType) {
    return null;
  }

  return header;
});

const ratios = [0.54, 0.57, 0.66, 0.71];
const quizRatios = [0.75, 0.79, 0.81, 0.85];

// 简单的字符串哈希函数，避免不同字符串产生相同的哈希值
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 转换为32位整数
  }
  return Math.abs(hash);
};

const calcCardRatioById = (id: string, type: string) => {
  const hash = hashString(id);

  if (type === 'quiz-card') {
    return quizRatios[hash % quizRatios.length];
  }

  return ratios[hash % ratios.length];
};

export const DocListItemComponent = memo(function DocListItemComponent({
  itemId,
  groupId,
}: {
  groupId: string;
  itemId: string;
}) {
  return <DocListItem docId={itemId} groupId={groupId} />;
});

export const CardsExplorer = ({
  className,
  disableMultiSelectToolbar,
  disableMultiDelete,
  onRestore,
  onDelete,
}: {
  className?: string;
  disableMultiSelectToolbar?: boolean;
  disableMultiDelete?: boolean;
  // eslint-disable-next-line no-unused-vars
  onRestore?: (ids: string[]) => void;
  /** Override the default delete action */
  // eslint-disable-next-line no-unused-vars
  onDelete?: (ids: string[]) => void;
}) => {
  const t = useI18n();
  const contextValue = useContext(DocExplorerContext);
  const docsService = useService(DocsService);

  const groupBy = useLiveData(contextValue.groupBy$);
  const groups = useLiveData(contextValue.groups$);
  const view = useLiveData(contextValue.view$);
  const selectMode = useLiveData(contextValue.selectMode$);
  const selectedDocIds = useLiveData(contextValue.selectedDocIds$);
  const collapsedGroups = useLiveData(contextValue.collapsedGroups$);

  const { openConfirmModal } = useConfirmModal();

  const masonryItems = useMemo(() => {
    const items = groups.map((group: any) => {
      return {
        id: group.key,
        Component: groupBy ? GroupHeader : undefined,
        height: groupBy ? 24 : 0,
        className: styles.groupHeader,
        items: group.items.map((docId: string) => {
          if (view === 'list') {
            return {
              id: docId,
              Component: DocListItemComponent,
              height: 42,
            } satisfies MasonryItem;
          }
          return {
            id: docId,
            Component: DocListItemComponent,
            ratio:
              view === 'grid'
                ? ratios[0]
                : calcCardRatioById(
                    docId,
                    Math.random() > 0.5 ? 'quiz-card' : 'flashcard'
                  ),
          } satisfies MasonryItem;
        }),
      } satisfies MasonryGroup;
    });
    return items;
  }, [groupBy, groups, view]);

  const handleCloseFloatingToolbar = useCallback(() => {
    contextValue.selectMode$?.next(false);
    contextValue.selectedDocIds$.next([]);
  }, [contextValue]);

  const handleMultiDelete = useCallback(() => {
    if (disableMultiDelete) {
      handleCloseFloatingToolbar();
      return;
    }
    if (selectedDocIds.length === 0) {
      return;
    }
    if (onDelete) {
      onDelete(contextValue.selectedDocIds$.value);
      handleCloseFloatingToolbar();
      return;
    }

    openConfirmModal({
      title: t['com.affine.moveToTrash.confirmModal.title.multiple']({
        number: selectedDocIds.length.toString(),
      }),
      description: t[
        'com.affine.moveToTrash.confirmModal.description.multiple'
      ]({
        number: selectedDocIds.length.toString(),
      }),
      cancelText: t['com.affine.confirmModal.button.cancel'](),
      confirmText: t.Delete(),
      confirmButtonOptions: {
        variant: 'error',
      },
      onConfirm: () => {
        const selectedDocIds = contextValue.selectedDocIds$.value;
        for (const docId of selectedDocIds) {
          const doc = docsService.list.doc$(docId).value;
          doc?.moveToTrash();
        }
      },
    });
  }, [
    contextValue.selectedDocIds$,
    disableMultiDelete,
    docsService.list,
    handleCloseFloatingToolbar,
    onDelete,
    openConfirmModal,
    selectedDocIds.length,
    t,
  ]);
  const handleMultiRestore = useCallback(() => {
    const selectedDocIds = contextValue.selectedDocIds$.value;
    onRestore?.(selectedDocIds);
    handleCloseFloatingToolbar();
  }, [
    contextValue.selectedDocIds$.value,
    handleCloseFloatingToolbar,
    onRestore,
  ]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        contextValue.selectMode$?.next(false);
        contextValue.selectedDocIds$.next([]);
        contextValue.prevCheckAnchorId$?.next(null);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [contextValue]);

  const responsivePaddingX = useCallback(
    (w: number) => (w > 500 ? 48 : w > 393 ? 40 : 32),
    []
  );

  return (
    <>
      <Masonry
        className={className}
        items={masonryItems}
        gapY={BUILD_CONFIG.isMobileEdition ? 12 : view === 'list' ? 12 : 24}
        gapX={BUILD_CONFIG.isMobileEdition ? 12 : 24}
        groupsGap={12}
        groupHeaderGapWithItems={12}
        columns={view === 'list' ? 1 : undefined}
        itemWidthMin={window.innerWidth > 768 ? 380 : 310}
        preloadHeight={100}
        itemWidth={'stretch'}
        virtualScroll
        collapsedGroups={collapsedGroups}
        paddingY={BUILD_CONFIG.isMobileEdition ? 12 : 0}
        paddingX={BUILD_CONFIG.isMobileEdition ? 16 : responsivePaddingX}
      />
      {!disableMultiSelectToolbar || onRestore ? (
        <ListFloatingToolbar
          open={!!selectMode}
          onDelete={disableMultiDelete ? undefined : handleMultiDelete}
          onRestore={onRestore ? handleMultiRestore : undefined}
          onClose={handleCloseFloatingToolbar}
          content={
            <Trans
              i18nKey="com.affine.page.toolbar.selected"
              count={selectedDocIds.length}
            >
              <div style={{ color: cssVarV2.text.secondary }}>
                {{ count: selectedDocIds.length } as any}
              </div>
              selected
            </Trans>
          }
        />
      ) : null}
    </>
  );
};
