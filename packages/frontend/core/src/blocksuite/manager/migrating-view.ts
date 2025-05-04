import { AffineCommonViewExtension } from '@affine/core/blocksuite/manager/common-view';
import {
  AffineEditorViewExtension,
  type AffineEditorViewOptions,
} from '@affine/core/blocksuite/manager/editor-view';
import { ViewExtensionManager } from '@blocksuite/affine/ext-loader';
import { getInternalViewExtensions } from '@blocksuite/affine/extensions/view';
import type { FrameworkProvider } from '@toeverything/infra';

const manager = new ViewExtensionManager([
  ...getInternalViewExtensions(),

  AffineCommonViewExtension,
  AffineEditorViewExtension,
]);

export function getViewManager(
  framework?: FrameworkProvider,
  enableAI?: boolean,
  options?: AffineEditorViewOptions
) {
  manager.configure(AffineCommonViewExtension, {
    framework,
    enableAI,
  });
  manager.configure(AffineEditorViewExtension, options);
  return manager;
}
