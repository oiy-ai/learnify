import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const root = style({
  padding: 8,
  transition: 'all 0.8s ease',
  position: 'relative',
  overflow: 'hidden',

  selectors: {
    '&:hover::after': {
      content: '',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: cssVarV2('layer/insideBorder/border'),
      opacity: 0.3,
      pointerEvents: 'none',
    },
  },
});

export const image = style({
  maxWidth: '100%',
  height: 'auto',
  borderRadius: 4,
});
