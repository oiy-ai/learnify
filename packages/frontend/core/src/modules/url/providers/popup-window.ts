import { createIdentifier } from '@toeverything/infra';

export interface PopupWindowProvider {
  /**
   * open a popup window, provide different implementations in different environments.
   * e.g. in electron, use system default browser to open a popup window.
   */
  open(url: string): void;
}

export const PopupWindowProvider = createIdentifier<PopupWindowProvider>(
  'PopupWindowProvider'
);
