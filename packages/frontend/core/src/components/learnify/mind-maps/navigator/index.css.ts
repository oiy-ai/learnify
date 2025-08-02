import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const container = style({
  position: 'relative',
});

export const root = style({
  transition: 'all 0.8s ease',
  position: 'relative',
  overflow: 'visible',
  borderRadius: 8,
  height: '210px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  selectors: {
    '&::after': {
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
  borderRadius: 8,
});

export const floatingButton = style({
  position: 'absolute',
  bottom: '15px',
  width: '180px',
  font: 'var(--affine-font-lg)',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 999,
  backgroundColor: cssVarV2('layer/background/primary'),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.2s ease',

  ':hover': {
    transform: 'translateX(-50%) translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
  },
});
