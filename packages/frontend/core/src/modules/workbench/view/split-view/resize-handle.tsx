import { useDropTarget } from '@affine/component';
import type { AffineDNDData } from '@affine/core/types/dnd';
import { useLiveData, useService } from '@toeverything/infra';
import { useAtomValue } from 'jotai';
import type { HTMLAttributes } from 'react';
import { useCallback } from 'react';

import type { View } from '../../entities/view';
import { WorkbenchService } from '../../services/workbench';
import * as styles from './split-view.css';
import { draggingOverResizeHandleAtom } from './state';
import { allowedSplitViewEntityTypes } from './types';

interface ResizeHandleProps extends HTMLAttributes<HTMLDivElement> {
  state: 'resizing' | 'drop-indicator' | 'idle';
  edge: 'left' | 'right';
  view: View;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
  onResizing?: (offset: { x: number; y: number }) => void;
}
export const ResizeHandle = ({
  state,
  view,
  edge,
  onResizing,
  onResizeStart,
  onResizeEnd,
}: ResizeHandleProps) => {
  const workbench = useService(WorkbenchService).workbench;
  const views = useLiveData(workbench.views$);

  const draggingOverHandle = useAtomValue(draggingOverResizeHandleAtom);

  const draggingOver =
    draggingOverHandle?.edge === edge && draggingOverHandle.viewId === view.id;

  const index = views.findIndex(v => v.id === view.id);

  const isLast = index === views.length - 1;
  const isFirst = index === 0;

  const { dropTargetRef } = useDropTarget<AffineDNDData>(() => {
    return {
      data: {
        at: 'workbench:resize-handle',
        edge,
        viewId: view.id,
      },
      canDrop: data => {
        return (
          (!!data.source.data.entity?.type &&
            allowedSplitViewEntityTypes.has(data.source.data.entity?.type)) ||
          data.source.data.from?.at === 'workbench:link'
        );
      },
    };
  }, [edge, view.id]);

  // TODO(@catsjuice): touch support
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!onResizing || !onResizeStart || !onResizeEnd) {
        return;
      }

      e.preventDefault();

      onResizeStart?.();
      const prevPos = { x: e.clientX, y: e.clientY };

      function onMouseMove(e: MouseEvent) {
        e.preventDefault();
        const dx = e.clientX - prevPos.x;
        const dy = e.clientY - prevPos.y;
        onResizing?.({ x: dx, y: dy });
        prevPos.x = e.clientX;
        prevPos.y = e.clientY;
      }

      function onMouseUp(e: MouseEvent) {
        e.preventDefault();
        onResizeEnd?.();
        document.removeEventListener('mousemove', onMouseMove);
      }

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp, { once: true });
    },
    [onResizeEnd, onResizeStart, onResizing]
  );

  const canResize =
    state === 'idle' &&
    !(isLast && edge === 'right') &&
    !(isFirst && edge === 'left');

  return (
    <div
      ref={dropTargetRef}
      data-edge={edge}
      onMouseDown={onMouseDown}
      data-is-last={isLast}
      data-is-first={isFirst}
      data-state={state}
      data-dragging-over={state === 'drop-indicator' ? draggingOver : false}
      data-can-resize={canResize}
      className={styles.resizeHandle}
    />
  );
};
