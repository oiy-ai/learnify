import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const overlayContainer = style({
  padding: '32px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minHeight: '320px',
});

// Loading styles
export const loadingContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '20px',
  width: '100%',
});

export const loadingIcon = style({
  marginBottom: '8px',
});

export const loadingTitle = style({
  fontSize: '18px',
  fontWeight: 600,
  color: cssVarV2.text.primary,
  margin: 0,
  textAlign: 'center',
});

export const loadingMessage = style({
  fontSize: '14px',
  color: cssVarV2.text.secondary,
  margin: 0,
  textAlign: 'center',
  maxWidth: '320px',
});

// Overall progress styles
export const overallProgress = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
  marginTop: '12px',
  marginBottom: '8px',
});

export const overallProgressText = style({
  fontSize: '14px',
  fontWeight: 600,
  color: cssVarV2.text.primary,
});

export const currentItemName = style({
  fontSize: '12px',
  color: cssVarV2.text.secondary,
});

// Progress bar styles
export const progressContainer = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  width: '100%',
  marginTop: '8px',
});

export const progressBar = style({
  flex: 1,
  height: '8px',
  backgroundColor: cssVarV2.layer.background.secondary,
  borderRadius: '4px',
  overflow: 'hidden',
  position: 'relative',
});

export const progressFill = style({
  height: '100%',
  backgroundColor: cssVarV2.button.primary,
  borderRadius: '4px',
  transition: 'width 0.3s ease-out',
  position: 'relative',
  '::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
    animation: 'shimmer 2s infinite',
  },
  '@keyframes shimmer': {
    '0%': {
      transform: 'translateX(-100%)',
    },
    '100%': {
      transform: 'translateX(100%)',
    },
  },
});

export const progressText = style({
  fontSize: '14px',
  fontWeight: 500,
  color: cssVarV2.text.secondary,
  minWidth: '40px',
  textAlign: 'right',
});

// Stage indicators
export const stageIndicators = style({
  display: 'flex',
  gap: '8px',
  marginTop: '12px',
});

export const stageIndicator = style({
  padding: '4px 12px',
  fontSize: '12px',
  borderRadius: '12px',
  backgroundColor: cssVarV2.layer.background.secondary,
  color: cssVarV2.text.secondary,
  transition: 'all 0.3s ease',
});

export const active = style({
  backgroundColor: cssVarV2.button.primary,
  color: 'white',
  fontWeight: 500,
});

export const completed = style({
  backgroundColor: cssVarV2.button.success,
  color: 'white',
  opacity: 0.8,
});

// Error styles
export const errorContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  width: '100%',
});

export const errorIcon = style({
  color: cssVarV2.status.error,
  fontSize: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const errorTitle = style({
  fontSize: '18px',
  fontWeight: 600,
  color: cssVarV2.text.primary,
  margin: 0,
});

export const errorMessage = style({
  fontSize: '14px',
  color: cssVarV2.text.secondary,
  margin: 0,
  textAlign: 'center',
  maxWidth: '320px',
});

export const errorActions = style({
  display: 'flex',
  gap: '12px',
  marginTop: '12px',
});

// Button styles
export const cancelButton = style({
  padding: '8px 20px',
  fontSize: '14px',
  border: `1px solid ${cssVarV2.button.secondary}`,
  borderRadius: '8px',
  backgroundColor: 'transparent',
  color: cssVarV2.text.primary,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  ':hover': {
    backgroundColor: cssVarV2.layer.background.hoverOverlay,
  },
});

export const retryButton = style({
  padding: '8px 20px',
  fontSize: '14px',
  border: 'none',
  borderRadius: '8px',
  backgroundColor: cssVarV2.button.primary,
  color: 'white',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontWeight: 500,
  ':hover': {
    opacity: 0.9,
  },
});

export const cancelButtonSmall = style({
  marginTop: '16px',
  padding: '6px 16px',
  fontSize: '13px',
  border: `1px solid ${cssVarV2.button.secondary}`,
  borderRadius: '6px',
  backgroundColor: 'transparent',
  color: cssVarV2.text.secondary,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  ':hover': {
    backgroundColor: cssVarV2.layer.background.hoverOverlay,
    color: cssVarV2.text.primary,
  },
});
