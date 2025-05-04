import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const root = style({
  cursor: 'grab',
  color: cssVarV2.icon.secondary,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const svg = style({
  borderRadius: 8,
  selectors: {
    [`${root}[data-dragging="true"] &, ${root}:hover &`]: {
      backgroundColor: cssVarV2.layer.background.hoverOverlay,
    },
  },
});
