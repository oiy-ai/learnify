import { EditorService } from '@affine/core/modules/editor';
import { GfxControllerIdentifier } from '@blocksuite/std/gfx';
import { useLiveData, useService } from '@toeverything/infra';
import { useEffect, useRef } from 'react';

export const ZoomToolbarWrapper = () => {
  const editorService = useService(EditorService);
  const editor = editorService.editor;
  const editorContainer = useLiveData(editor.editorContainer$);
  const mode = useLiveData(editor.mode$);

  const containerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<any>(null);

  useEffect(() => {
    if (!editorContainer || mode !== 'edgeless' || !containerRef.current) {
      return;
    }

    // 保存当前的 ref 值，避免在 cleanup 时访问已变化的 ref
    const container = containerRef.current;

    // 延迟创建以确保 edgeless 模式完全初始化
    const timer = setTimeout(() => {
      try {
        // 获取 GfxController
        const gfx = editorContainer.host?.std.get(GfxControllerIdentifier);

        if (!gfx || !gfx.viewport) {
          return;
        }

        // 检查 edgeless-zoom-toolbar 自定义元素是否已经被定义
        if (!customElements.get('edgeless-zoom-toolbar')) {
          return;
        }

        // 创建 toolbar 实例
        if (!toolbarRef.current && container) {
          // 创建 edgeless-zoom-toolbar 元素
          const toolbar = document.createElement(
            'edgeless-zoom-toolbar'
          ) as any;

          // 设置属性
          toolbar.std = editorContainer.host.std;
          toolbar.gfxController = gfx;
          toolbar.layout = 'horizontal';
          toolbar.hideOnReadonly = false; // 在预览模式下也显示

          toolbarRef.current = toolbar;
          container.append(toolbar);

          // 自动触发一次 Fit to Screen
          if (gfx.fitToScreen) {
            // 延迟执行以确保视图完全渲染
            setTimeout(() => {
              gfx.fitToScreen();
            }, 100);
          }
        }
      } catch (error) {
        console.error('Failed to create zoom toolbar:', error);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      const toolbar = toolbarRef.current;
      if (toolbar && container && container.contains(toolbar)) {
        toolbar.remove();
        toolbarRef.current = null;
      }
    };
  }, [editorContainer, mode]);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        minHeight: '40px',
      }}
    />
  );
};
