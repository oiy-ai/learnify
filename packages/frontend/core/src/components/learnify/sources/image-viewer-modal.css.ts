import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  height: '90%',
  width: '70%',
  overflow: 'hidden',
  backgroundColor: cssVarV2('layer/background/primary'),
  borderRadius: '8px',
});

export const imageViewerContainer = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  overflow: 'auto',
  marginTop: '40px',
  backgroundColor: cssVarV2('layer/background/primary'),

  // Grid background pattern
  selectors: {
    '&:before': {
      position: 'absolute',
      content: '""',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 0,
      opacity: 0.25,
      backgroundSize: '20px 20px',
      backgroundImage: `linear-gradient(${cssVarV2('button/grabber/default')} 1px, transparent 1px), linear-gradient(to right, ${cssVarV2('button/grabber/default')} 1px, transparent 1px)`,
      pointerEvents: 'none',
    },
  },
});

export const imageWrapper = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  maxWidth: 'calc(100% - 40px)',
  maxHeight: 'calc(100% - 40px)',
  margin: '20px',
  zIndex: 1,
});

export const image = style({
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
  background: cssVarV2('layer/white'),
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: cssVarV2('layer/insideBorder/border'),
  boxShadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.10)',
});
