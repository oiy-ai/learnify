import { cssVarV2 } from '@toeverything/theme/v2';
import { createVar, style } from '@vanilla-extract/css';

export const root = style({
  width: '100%',
  position: 'fixed',
  top: 0,
  zIndex: 1,
  backgroundColor: cssVarV2('layer/background/secondary'),
});
export const headerSpacer = style({
  height: 44,
});
export const inner = style({
  height: 44,
  padding: '0 6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});
const contentMaxWidth = createVar('contentMaxWidth');
export const content = style({
  vars: {
    [contentMaxWidth]: 'unset',
  },
  maxWidth: contentMaxWidth,
  selectors: {
    '&.center': {
      vars: {
        // gap(6 * 2) + button(44 * 2) + padding(8 * 2)
        [contentMaxWidth]: 'calc(100% - 12px - 88px - 16px)',
      },
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'fit-content',
      display: 'flex',
      justifyContent: 'center',
      pointerEvents: 'none',
    },
    '&:not(.center)': {
      width: 0,
      flex: 1,
    },
  },
});
export const spacer = style({
  width: 0,
  flex: 1,
});
export const prefix = style({
  display: 'flex',
  alignItems: 'center',
  gap: 0,
});
export const suffix = style({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
});
