import type { AffineEditorViewOptions } from '@affine/core/blocksuite/manager/editor-view';
import type { ExtensionType } from '@blocksuite/affine/store';
import { type FrameworkProvider } from '@toeverything/infra';

import { getViewManager } from '../../manager/migrating-view';

export function enableEditorExtension(
  framework: FrameworkProvider,
  mode: 'edgeless' | 'page',
  enableAI: boolean,
  options: AffineEditorViewOptions
): ExtensionType[] {
  const manager = getViewManager(framework, enableAI, options);
  if (BUILD_CONFIG.isMobileEdition) {
    if (mode === 'page') {
      return manager.get('mobile-page');
    }

    return manager.get('mobile-edgeless');
  }
  return manager.get(mode);
}
