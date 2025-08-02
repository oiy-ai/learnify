import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const container = style({
  position: 'relative',
});

export const root = style({
  transition: 'all 0.8s ease',
  position: 'relative',
  overflow: 'hidden',
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
    '&[data-theme="dark"]::before': {
      content: '',
      position: 'absolute',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      borderRadius: 8,
      pointerEvents: 'none',
      zIndex: 1,
    },
  },
});

export const image = style({
  maxWidth: '100%',
  height: 'auto',
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

export const playerContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  padding: '20px',
  width: '100%',
  height: '100%',
});

export const topSection = style({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  width: '100%',
});

export const albumArt = style({
  width: '60px',
  height: '60px',
  backgroundColor: cssVarV2('layer/background/secondary'),
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

export const albumIcon = style({
  width: '32px',
  height: '32px',
  color: cssVarV2('icon/primary'),
});

export const playerInfo = style({
  flex: 1,
  gap: '4px',
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
});

export const podcastTitle = style({
  fontSize: '16px',
  fontWeight: 600,
  color: cssVarV2('text/primary'),
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const podcastAuthor = style({
  fontSize: '14px',
  color: cssVarV2('text/secondary'),
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const progressBar = style({
  width: '100%',
  height: '4px',
  backgroundColor: cssVarV2('layer/background/secondary'),
  borderRadius: '2px',
  position: 'relative',
  overflow: 'hidden',
});

export const progressFill = style({
  position: 'absolute',
  top: 0,
  left: 0,
  height: '100%',
  backgroundColor: cssVarV2('button/primary'),
  transition: 'width 0.3s ease',
});

export const timeInfo = style({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '12px',
  color: cssVarV2('text/secondary'),
  marginTop: '-8px',
});

export const playerControls = style({
  display: 'flex',
  marginTop: '-20px',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
  width: '100%',
});

export const controlButton = style({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  color: cssVarV2('icon/primary'),
  transition: 'opacity 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '42px',
  height: '42px',

  ':hover': {
    opacity: 0.8,
  },

  ':active': {
    opacity: 0.6,
  },
});

export const playButton = style({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  color: cssVarV2('button/primary'),
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '48px',
  height: '48px',

  ':hover': {
    transform: 'scale(1.1)',
  },

  ':active': {
    transform: 'scale(0.95)',
  },
});

export const controlIcon = style({
  width: '36px',
  height: '36px',
});

export const playIcon = style({
  width: '42px',
  height: '42px',
});
