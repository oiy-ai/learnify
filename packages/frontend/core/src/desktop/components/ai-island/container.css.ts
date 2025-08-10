import { style } from '@vanilla-extract/css';

export const islandContainer = style({
  position: 'absolute',
  right: 28,
  bottom: 28,
  zIndex: 999,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '12px',
  selectors: {
    '&.trash': {
      bottom: '78px',
    },
  },
});
