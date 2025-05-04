import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

import { dayCell } from './day-cell.css';

export const weekRow = style({
  display: 'flex',
  gap: 4,
  justifyContent: 'space-between',
});
export const weekHeaderCell = style([
  dayCell,
  {
    color: cssVarV2('text/secondary'),
  },
]);

export const weekSwipeRoot = style({
  width: '100%',
  overflow: 'hidden',
});
export const weekSwipeSlide = style({
  width: '300%',
  marginLeft: '-100%',
  display: 'flex',
});
export const weekSwipeItem = style({
  width: 0,
  flex: 1,
  padding: '0 16px',
});
