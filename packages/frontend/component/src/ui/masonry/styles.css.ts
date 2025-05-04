import { style } from '@vanilla-extract/css';

export const root = style({
  position: 'relative',
  selectors: {
    '&.scrollable': {
      overflowY: 'auto',
    },
  },
});

export const item = style({
  position: 'absolute',
});
