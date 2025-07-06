import { DocsService } from '@affine/core/modules/doc';
import { DocDisplayMetaService } from '@affine/core/modules/doc-display-meta';
import track from '@affine/track';
import { useLiveData, useService } from '@toeverything/infra';
import { useCallback, useContext } from 'react';

import { DocExplorerContext } from '../../../explorer/context';
import * as styles from '../../../explorer/docs-view/doc-list-item.css';
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
  const selectMode = useLiveData(contextValue.selectMode$);
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
      data-selected={contextValue.selectedDocIds$.value.includes(docId)}
      className={styles.root}
      data-testid={`doc-list-item`}
      data-doc-id={docId}
      style={{ cursor: 'pointer' }}
    >
      <ListViewDoc docId={docId} />
    </div>
  );
};

// 自定义的列表视图组件，不包含导航功能
const ListViewDoc = ({ docId }: { docId: string }) => {
  const docsService = useService(DocsService);
  const doc = useLiveData(docsService.list.doc$(docId));
  const docDisplayMetaService = useService(DocDisplayMetaService);
  const Icon = useLiveData(docDisplayMetaService.icon$(docId));
  const title = useLiveData(docDisplayMetaService.title$(docId));

  if (!doc) {
    return null;
  }

  return (
    <li className={styles.listViewRoot}>
      <div className={styles.listIcon}>
        <Icon />
      </div>
      <div className={styles.listBrief}>
        <div className={styles.listTitle} data-testid="doc-list-item-title">
          {title}
        </div>
        <div className={styles.listPreview}>
          <PagePreview pageId={docId} rawType="mind-maps" />
        </div>
      </div>
    </li>
  );
};
