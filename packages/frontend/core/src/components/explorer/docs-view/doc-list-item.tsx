import {
  ContextMenu,
  DragHandle as DragHandleIcon,
  Tooltip,
  useDraggable,
} from '@affine/component';
import { DocsService } from '@affine/core/modules/doc';
import { DocDisplayMetaService } from '@affine/core/modules/doc-display-meta';
import { WorkbenchLink } from '@affine/core/modules/workbench';
import type { AffineDNDData } from '@affine/core/types/dnd';
import { useI18n } from '@affine/i18n';
import track from '@affine/track';
import {
  AutoTidyUpIcon,
  PropertyIcon,
  ResizeTidyUpIcon,
} from '@blocksuite/icons/rc';
import { useLiveData, useService } from '@toeverything/infra';
import {
  type HTMLProps,
  memo,
  type ReactNode,
  type SVGProps,
  useCallback,
  useContext,
} from 'react';

import { PagePreview } from '../../learnify/page-list/page-content-preview';
import { DocExplorerContext } from '../context';
import { quickActions } from '../quick-actions.constants';
import * as styles from './doc-list-item.css';
import { MoreMenuButton, MoreMenuContent } from './more-menu';
import { CardViewProperties, ListViewProperties } from './properties';

export type DocListItemView = 'list' | 'grid' | 'masonry';

export const DocListViewIcon = ({
  view,
  ...props
}: { view: DocListItemView } & SVGProps<SVGSVGElement>) => {
  const Component = {
    list: PropertyIcon,
    grid: ResizeTidyUpIcon,
    masonry: AutoTidyUpIcon,
  }[view];

  return <Component {...props} />;
};

export interface DocListItemProps {
  docId: string;
  groupId: string;
  rawType?: 'flashcards' | 'mind-maps';
}

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
export const DocListItem = ({ ...props }: DocListItemProps) => {
  const contextValue = useContext(DocExplorerContext);
  const view = useLiveData(contextValue.view$) ?? 'list';
  const groups = useLiveData(contextValue.groups$);
  const selectMode = useLiveData(contextValue.selectMode$);
  const selectedDocIds = useLiveData(contextValue.selectedDocIds$);
  const prevCheckAnchorId = useLiveData(contextValue.prevCheckAnchorId$);

  const handleMultiSelect = useCallback(
    (prevCursor: string, currCursor: string) => {
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
    [contextValue, groups]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<Element>) => {
      const { docId, groupId } = props;
      const currCursor = MixId.create(groupId, docId);
      if (selectMode || e.shiftKey) {
        e.preventDefault();
      }

      if (selectMode) {
        if (e.shiftKey && prevCheckAnchorId) {
          // do multi select
          handleMultiSelect(prevCheckAnchorId, currCursor);
        } else {
          contextValue.selectedDocIds$?.next(
            contextValue.selectedDocIds$.value.includes(docId)
              ? contextValue.selectedDocIds$.value.filter(id => id !== docId)
              : [...contextValue.selectedDocIds$.value, docId]
          );
          contextValue.prevCheckAnchorId$?.next(currCursor);
        }
      } else {
        if (e.shiftKey) {
          contextValue.selectMode$?.next(true);
          contextValue.selectedDocIds$?.next([docId]);
          contextValue.prevCheckAnchorId$?.next(currCursor);
          return;
        } else {
          // as link
          track.allDocs.list.doc.openDoc();
          return;
        }
      }
    },
    [contextValue, handleMultiSelect, prevCheckAnchorId, props, selectMode]
  );

  const { dragRef, CustomDragPreview } = useDraggable<AffineDNDData>(
    () => ({
      canDrag: true,
      data: {
        entity: {
          type: 'doc',
          id: props.docId as string,
        },
        from: {
          at: 'all-docs:list',
        },
      },
    }),
    [props.docId]
  );

  return (
    <>
      <WorkbenchLink
        ref={dragRef}
        draggable={false}
        to={
          props.rawType === 'flashcards'
            ? `/flashcard/${props.docId}`
            : `/${props.docId}`
        }
        onClick={handleClick}
        data-selected={selectedDocIds.includes(props.docId)}
        className={styles.root}
        data-testid={`doc-list-item`}
        data-doc-id={props.docId}
      >
        {view === 'list' ? (
          <ListViewDoc {...props} />
        ) : (
          <CardViewDoc {...props} />
        )}
      </WorkbenchLink>
      <CustomDragPreview>
        <div className={styles.dragPreview}>
          <RawDocIcon id={props.docId} className={styles.dragPreviewIcon} />
          <RawDocTitle id={props.docId} />
        </div>
      </CustomDragPreview>
    </>
  );
};

const RawDocIcon = memo(function RawDocIcon({
  id,
  ...props
}: HTMLProps<SVGSVGElement>) {
  const docDisplayMetaService = useService(DocDisplayMetaService);
  const Icon = useLiveData(id ? docDisplayMetaService.icon$(id) : null);
  return <Icon {...props} />;
});
const RawDocTitle = memo(function RawDocTitle({ id }: { id: string }) {
  const docDisplayMetaService = useService(DocDisplayMetaService);
  const title = useLiveData(docDisplayMetaService.title$(id));
  return title;
});
const RawDocPreview = memo(function RawDocPreview({
  id,
  loading,
  rawType,
}: {
  id: string;
  loading?: ReactNode;
  rawType?: 'flashcards' | 'mind-maps';
}) {
  return <PagePreview pageId={id} fallback={loading} rawType={rawType} />;
});
const DragHandle = memo(function DragHandle({
  id,
  ...props
}: HTMLProps<HTMLDivElement>) {
  const contextValue = useContext(DocExplorerContext);
  const selectMode = useLiveData(contextValue.selectMode$);
  const showDragHandle = useLiveData(contextValue.showDragHandle$);

  if (selectMode || !id || !showDragHandle) {
    return null;
  }

  return (
    <div {...props}>
      <DragHandleIcon />
    </div>
  );
});
// Different with RawDocIcon, refer to `ExplorerDisplayPreference.showDocIcon`
const DocIcon = memo(function DocIcon({
  id,
  ...props
}: HTMLProps<HTMLDivElement>) {
  const contextValue = useContext(DocExplorerContext);
  const showDocIcon = useLiveData(contextValue.showDocIcon$);
  if (!showDocIcon) {
    return null;
  }
  return (
    <div {...props}>
      <RawDocIcon id={id} />
    </div>
  );
});
const DocTitle = memo(function DocTitle({
  id,
  ...props
}: HTMLProps<HTMLDivElement>) {
  if (!id) return null;
  return (
    <div {...props}>
      <RawDocTitle id={id} />
    </div>
  );
});
const DocPreview = memo(function DocPreview({
  id,
  loading,
  rawType,
  ...props
}: HTMLProps<HTMLDivElement> & {
  loading?: ReactNode;
  rawType?: 'flashcards' | 'mind-maps';
}) {
  const contextValue = useContext(DocExplorerContext);
  const showDocPreview = useLiveData(contextValue.showDocPreview$);

  if (!id || !showDocPreview) return null;

  return (
    <div {...props}>
      <RawDocPreview id={id} loading={loading} rawType={rawType} />
    </div>
  );
});

const listMoreMenuContentOptions = {
  side: 'bottom',
  align: 'end',
  sideOffset: 12,
  alignOffset: -4,
} as const;
export const ListViewDoc = ({ docId }: DocListItemProps) => {
  const t = useI18n();
  const docsService = useService(DocsService);
  const doc = useLiveData(docsService.list.doc$(docId));
  const contextValue = useContext(DocExplorerContext);
  const showMoreOperation = useLiveData(contextValue.showMoreOperation$);

  if (!doc) {
    return null;
  }

  return (
    <ContextMenu
      asChild
      disabled={!showMoreOperation}
      items={<MoreMenuContent docId={docId} />}
    >
      <li className={styles.listViewRoot}>
        <DragHandle id={docId} className={styles.listDragHandle} />
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
          <DocPreview id={docId} className={styles.listPreview} />
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
    </ContextMenu>
  );
};

const cardMoreMenuContentOptions = {
  side: 'bottom',
  align: 'end',
  sideOffset: 12,
  alignOffset: -4,
} as const;

export const CardViewDoc = ({ docId, rawType }: DocListItemProps) => {
  const t = useI18n();
  const contextValue = useContext(DocExplorerContext);
  const docsService = useService(DocsService);
  const doc = useLiveData(docsService.list.doc$(docId));
  const showMoreOperation = useLiveData(contextValue.showMoreOperation$);

  if (!doc) {
    return null;
  }

  return (
    <ContextMenu
      asChild
      disabled={!showMoreOperation}
      items={<MoreMenuContent docId={docId} />}
    >
      <li className={styles.cardViewRoot}>
        <DragHandle id={docId} className={styles.cardDragHandle} />
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
          rawType={rawType}
        />
        <CardViewProperties docId={docId} />
      </li>
    </ContextMenu>
  );
};
