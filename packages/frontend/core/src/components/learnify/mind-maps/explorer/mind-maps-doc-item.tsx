import { Tooltip, Wrapper } from '@affine/component';
import { DocsService } from '@affine/core/modules/doc';
import { DocDisplayMetaService } from '@affine/core/modules/doc-display-meta';
import { useI18n } from '@affine/i18n';
import track from '@affine/track';
import { useLiveData, useService } from '@toeverything/infra';
import { type HTMLProps, memo, useCallback, useContext } from 'react';

import { DocExplorerContext } from '../../../explorer/context';
import * as styles from '../../../explorer/docs-view/doc-list-item.css';
import { MoreMenuButton } from '../../../explorer/docs-view/more-menu';
import {
  CardViewProperties,
  ListViewProperties,
} from '../../../explorer/docs-view/properties';
import { quickActions } from '../../../explorer/quick-actions.constants';
import { PagePreview } from '../../../learnify/page-list/page-content-preview';

class MixId {
  static connector = '||';
  static create(groupId: string, docId: string) {
    return `${groupId}${this.connector}${docId}`;
  }
  static parse(mixId: string) {
    if (!mixId) {
      return { groupId: null, docId: null };
    }
    const [groupId, docId] = mixId.split(this.connector);
    return { groupId, docId };
  }
}

export interface MindMapDocListItemProps {
  docId: string;
  groupId: string;
}

export const MindMapDocListItem = ({
  docId,
  groupId,
}: MindMapDocListItemProps) => {
  const contextValue = useContext(DocExplorerContext);
  const view = useLiveData(contextValue.view$) ?? 'list';
  const selectMode = useLiveData(contextValue.selectMode$);
  const selectedDocIds = useLiveData(contextValue.selectedDocIds$);
  const prevCheckAnchorId = useLiveData(contextValue.prevCheckAnchorId$);

  const handleMultiSelect = useCallback(
    (prevCursor: string, currCursor: string) => {
      const groups = contextValue.groups$.value;
      const flattenList = groups.flatMap(group =>
        group.items.map(docId => MixId.create(group.key, docId))
      );

      const prev = contextValue.selectedDocIds$?.value ?? [];
      const prevIndex = flattenList.indexOf(prevCursor);
      const currIndex = flattenList.indexOf(currCursor);

      const lowerIndex = Math.min(prevIndex, currIndex);
      const upperIndex = Math.max(prevIndex, currIndex);

      const resSet = new Set(prev);
      const handledSet = new Set<string>();
      for (let i = lowerIndex; i <= upperIndex; i++) {
        const mixId = flattenList[i];
        const { groupId, docId } = MixId.parse(mixId);
        if (groupId === null || docId === null) {
          continue;
        }
        if (handledSet.has(docId) || mixId === prevCursor) {
          continue;
        }
        if (resSet.has(docId)) {
          resSet.delete(docId);
        } else {
          resSet.add(docId);
        }
        handledSet.add(docId);
      }

      contextValue.selectedDocIds$?.next(Array.from(resSet));
      contextValue.prevCheckAnchorId$?.next(currCursor);
    },
    [contextValue]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<Element>) => {
      const currCursor = MixId.create(groupId, docId);
      e.preventDefault(); // 阻止默认的导航行为

      if (selectMode) {
        if (e.shiftKey && prevCheckAnchorId) {
          // 多选
          handleMultiSelect(prevCheckAnchorId, currCursor);
        } else {
          // 单选切换
          contextValue.selectedDocIds$?.next(
            contextValue.selectedDocIds$.value.includes(docId)
              ? contextValue.selectedDocIds$.value.filter(id => id !== docId)
              : [...contextValue.selectedDocIds$.value, docId]
          );
          contextValue.prevCheckAnchorId$?.next(currCursor);
        }
      } else {
        if (e.shiftKey) {
          // 开启选择模式
          contextValue.selectMode$?.next(true);
          contextValue.selectedDocIds$?.next([docId]);
          contextValue.prevCheckAnchorId$?.next(currCursor);
        } else {
          // 单击选择文档用于预览
          contextValue.selectedDocIds$?.next([docId]);
          contextValue.prevCheckAnchorId$?.next(currCursor);
          track.allDocs.list.doc.openDoc();
        }
      }
    },
    [
      contextValue,
      handleMultiSelect,
      prevCheckAnchorId,
      docId,
      groupId,
      selectMode,
    ]
  );

  return (
    <div
      onClick={handleClick}
      data-selected={selectedDocIds.includes(docId)}
      className={styles.root}
      data-testid={`doc-list-item`}
      data-doc-id={docId}
      style={{ cursor: 'pointer' }}
    >
      {view === 'list' ? (
        <ListViewDoc docId={docId} groupId={groupId} />
      ) : (
        <CardViewDoc docId={docId} groupId={groupId} />
      )}
    </div>
  );
};

// Helper components
// removed custom Select; use quickActions.quickSelect like Notes list

const DocIcon = memo(function DocIcon({
  id,
  ...props
}: HTMLProps<HTMLDivElement>) {
  const contextValue = useContext(DocExplorerContext);
  const showDocIcon = useLiveData(contextValue.showDocIcon$);
  const docDisplayMetaService = useService(DocDisplayMetaService);
  const Icon = useLiveData(id ? docDisplayMetaService.icon$(id) : null);

  if (!showDocIcon || !Icon || !id) {
    return null;
  }

  return (
    <div {...props}>
      <Icon />
    </div>
  );
});

const DocTitle = memo(function DocTitle({
  id,
  ...props
}: HTMLProps<HTMLDivElement>) {
  const docDisplayMetaService = useService(DocDisplayMetaService);
  const title = useLiveData(docDisplayMetaService.title$(id));

  if (!id) return null;

  return <div {...props}>{title}</div>;
});

const DocPreview = memo(function DocPreview({
  id,
  loading,
  rawType,
  ...props
}: HTMLProps<HTMLDivElement> & {
  loading?: React.ReactNode;
  rawType?: 'flashcards' | 'mind-maps';
}) {
  const contextValue = useContext(DocExplorerContext);
  const showDocPreview = useLiveData(contextValue.showDocPreview$);

  if (!id || !showDocPreview) return null;

  return (
    <div {...props}>
      <PagePreview pageId={id} fallback={loading} rawType={rawType} />
    </div>
  );
});

const listMoreMenuContentOptions = {
  side: 'bottom',
  align: 'end',
  sideOffset: 12,
  alignOffset: -4,
} as const;

// 列表视图组件
const ListViewDoc = ({ docId }: MindMapDocListItemProps) => {
  const t = useI18n();
  const docsService = useService(DocsService);
  const doc = useLiveData(docsService.list.doc$(docId));

  if (!doc) {
    return null;
  }

  return (
    <li className={styles.listViewRoot}>
      {quickActions
        .filter(action => action.key === 'quickSelect')
        .map(action => {
          return (
            <Tooltip key={action.key} content={t.t(action.name)}>
              <action.Component doc={doc} />
            </Tooltip>
          );
        })}
      <DocIcon id={docId} className={styles.listIcon} />
      <div className={styles.listBrief}>
        <DocTitle
          id={docId}
          className={styles.listTitle}
          data-testid="doc-list-item-title"
        />
        <DocPreview
          id={docId}
          className={styles.listPreview}
          loading={<Wrapper height={20} width={10} />}
          rawType="mind-maps"
        />
      </div>
      <div className={styles.listSpace} />
      <ListViewProperties docId={docId} />
      {quickActions
        .filter(action => action.key !== 'quickSelect')
        .map(action => {
          return (
            <Tooltip key={action.key} content={t.t(action.name)}>
              <action.Component doc={doc} />
            </Tooltip>
          );
        })}
      <MoreMenuButton
        docId={docId}
        contentOptions={listMoreMenuContentOptions}
      />
    </li>
  );
};

const cardMoreMenuContentOptions = {
  side: 'bottom',
  align: 'end',
  sideOffset: 12,
  alignOffset: -4,
} as const;

// 卡片视图组件
const CardViewDoc = ({ docId }: MindMapDocListItemProps) => {
  const t = useI18n();
  const docsService = useService(DocsService);
  const doc = useLiveData(docsService.list.doc$(docId));

  if (!doc) {
    return null;
  }

  return (
    <li className={styles.cardViewRoot}>
      <header className={styles.cardViewHeader}>
        <DocIcon id={docId} className={styles.cardViewIcon} />
        <DocTitle
          id={docId}
          className={styles.cardViewTitle}
          data-testid="doc-list-item-title"
        />
        {quickActions.map(action => {
          return (
            <Tooltip key={action.key} content={t.t(action.name)}>
              <action.Component size="16" doc={doc} />
            </Tooltip>
          );
        })}
        <MoreMenuButton
          docId={docId}
          contentOptions={cardMoreMenuContentOptions}
          iconProps={{ size: '16' }}
        />
      </header>
      <DocPreview
        id={docId}
        className={styles.cardPreviewContainer}
        rawType="mind-maps"
      />
      <CardViewProperties docId={docId} />
    </li>
  );
};
