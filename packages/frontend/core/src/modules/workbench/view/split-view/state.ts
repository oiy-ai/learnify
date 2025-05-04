import { atom } from 'jotai';

import type { View } from '../../entities/view';

// global split view ui state
export const draggingOverViewAtom = atom<{
  view: View;
  index: number;
  edge: 'left' | 'right';
} | null>(null);

export const draggingViewAtom = atom<{
  view: View;
  index: number;
} | null>(null);

export const resizingViewAtom = atom<{
  view: View;
  index: number;
} | null>(null);

export const draggingOverResizeHandleAtom = atom<{
  viewId: string;
  edge: 'left' | 'right';
} | null>(null);
