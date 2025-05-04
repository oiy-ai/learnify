import { registerPlugin } from '@capacitor/core';

import type { NavigationGesturePlugin } from './definitions';

const NavigationGesture =
  registerPlugin<NavigationGesturePlugin>('NavigationGesture');

export * from './definitions';
export { NavigationGesture };
