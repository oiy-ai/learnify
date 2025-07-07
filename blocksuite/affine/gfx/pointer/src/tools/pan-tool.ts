import { EdgelessLegacySlotIdentifier } from '@blocksuite/affine-block-surface';
import { on } from '@blocksuite/affine-shared/utils';
import type { PointerEventState } from '@blocksuite/std';
import {
  BaseTool,
  InteractivityIdentifier,
  MouseButton,
  type ToolOptions,
} from '@blocksuite/std/gfx';
import { signal } from '@preact/signals-core';

interface RestorablePresentToolOptions {
  mode?: string; // 'fit' | 'fill', simplified to string for local use
  restoredAfterPan?: boolean;
}

export type PanToolOption = {
  panning: boolean;
};

export class PanTool extends BaseTool<PanToolOption> {
  static override toolName = 'pan';

  private _lastPoint: [number, number] | null = null;

  readonly panning$ = signal(false);

  get interactivity() {
    return this.std.getOptional(InteractivityIdentifier);
  }

  override get allowDragWithRightButton(): boolean {
    return true;
  }

  override dragEnd(e: PointerEventState): void {
    // 分发dragend事件给interactivity系统
    this.interactivity?.dispatchEvent('dragend', e);

    this._lastPoint = null;
    this.panning$.value = false;
  }

  override dragMove(e: PointerEventState): void {
    if (!this._lastPoint) return;

    const { viewport } = this.gfx;
    const { zoom } = viewport;

    const [lastX, lastY] = this._lastPoint;
    const deltaX = lastX - e.x;
    const deltaY = lastY - e.y;

    this._lastPoint = [e.x, e.y];

    viewport.applyDeltaCenter(deltaX / zoom, deltaY / zoom);
  }

  override dragStart(e: PointerEventState): void {
    this._lastPoint = [e.x, e.y];
    this.panning$.value = true;
  }

  override click(e: PointerEventState): void {
    // 分发点击事件给interactivity系统，使思维导图的展开/收起功能正常工作
    this.interactivity?.dispatchEvent('click', e);
  }

  override doubleClick(e: PointerEventState): void {
    // 分发双击事件给interactivity系统
    this.interactivity?.dispatchEvent('dblclick', e);
  }

  override pointerDown(e: PointerEventState): void {
    // 分发pointerdown事件给interactivity系统
    this.interactivity?.dispatchEvent('pointerdown', e);
  }

  override pointerMove(e: PointerEventState): void {
    // 分发pointer move事件给interactivity系统，使hover功能正常工作
    this.interactivity?.dispatchEvent('pointermove', e);
  }

  override pointerUp(e: PointerEventState): void {
    // 分发pointerup事件给interactivity系统
    this.interactivity?.dispatchEvent('pointerup', e);
  }

  override mounted(): void {
    this.addHook('pointerDown', evt => {
      const shouldPanWithMiddle = evt.raw.button === MouseButton.MIDDLE;

      if (!shouldPanWithMiddle) {
        return;
      }

      evt.raw.preventDefault();

      const currentTool = this.controller.currentToolOption$.peek();
      const restoreToPrevious = () => {
        const { toolType, options: originalToolOptions } = currentTool;
        const selectionToRestore = this.gfx.selection.surfaceSelections;
        if (!toolType) return;

        let finalOptions: ToolOptions<BaseTool<any>> | undefined =
          originalToolOptions;
        const PRESENT_TOOL_NAME = 'frameNavigator';

        if (toolType.toolName === PRESENT_TOOL_NAME) {
          // When restoring PresentTool (frameNavigator) after a temporary pan (e.g., via middle mouse button),
          // set 'restoredAfterPan' to true. This allows PresentTool to avoid an unwanted viewport reset
          // and maintain the panned position.
          const currentPresentOptions = originalToolOptions as
            | RestorablePresentToolOptions
            | undefined;
          finalOptions = {
            ...currentPresentOptions,
            restoredAfterPan: true,
          } as RestorablePresentToolOptions;
        }
        this.controller.setTool(toolType, finalOptions);
        this.gfx.selection.set(selectionToRestore);
      };

      // If in presentation mode, disable black background after middle mouse drag
      if (currentTool.toolType?.toolName === 'frameNavigator') {
        const slots = this.std.get(EdgelessLegacySlotIdentifier);
        slots.navigatorSettingUpdated.next({
          blackBackground: false,
        });
      }

      this.controller.setTool(PanTool, {
        panning: true,
      });

      const dispose = on(document, 'pointerup', evt => {
        if (evt.button === MouseButton.MIDDLE) {
          restoreToPrevious();
          dispose();
        }
      });

      return false;
    });
  }
}
