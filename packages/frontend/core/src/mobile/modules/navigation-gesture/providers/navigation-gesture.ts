import { createIdentifier } from '@toeverything/infra';

export interface NavigationGestureProvider {
  isEnabled: () => boolean;
  enable: () => void;
  disable: () => void;
}

export const NavigationGestureProvider =
  createIdentifier<NavigationGestureProvider>('NavigationGestureProvider');
