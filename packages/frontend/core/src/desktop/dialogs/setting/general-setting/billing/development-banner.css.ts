import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const developmentBanner = style({
  background: `linear-gradient(135deg, 
    rgba(99, 102, 241, 0.1) 0%, 
    rgba(79, 70, 229, 0.15) 25%, 
    rgba(124, 58, 237, 0.1) 50%, 
    rgba(79, 70, 229, 0.15) 75%, 
    rgba(99, 102, 241, 0.1) 100%)`,
  border: `2px solid ${cssVarV2.layer.insideBorder.border}`,
  borderRadius: '12px',
  padding: '20px 24px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  width: '100%',
  minHeight: 'auto',
  boxSizing: 'border-box',
  marginBottom: '24px',
  overflow: 'hidden',

  ':before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background:
      'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.2), transparent)',
    transition: 'left 0.5s ease',
    pointerEvents: 'none',
  },

  selectors: {
    '&[data-hovered="true"]': {
      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
      borderColor: 'rgba(99, 102, 241, 0.5)',
    },
    '&[data-hovered="true"]:before': {
      left: '100%',
    },
  },
});

export const bannerContent = style({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  position: 'relative',
  zIndex: 1,
});

export const bannerIconWrapper = style({
  width: '64px',
  height: '64px',
  borderRadius: '16px',
  backgroundColor: 'rgba(99, 102, 241, 0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  marginRight: '12px',
});

export const bannerIcon = style({
  fontSize: '28px',
  lineHeight: 1,
});

export const bannerText = style({
  flex: 1,
  minWidth: 0,
});

export const bannerTitle = style({
  fontSize: '18px',
  fontWeight: 600,
  color: cssVarV2.text.primary,
  margin: '0 0 8px 0',
  background: 'linear-gradient(90deg, #6366F1, #7C3AED)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
});

export const bannerDescription = style({
  fontSize: '14px',
  color: cssVarV2.text.secondary,
  margin: 0,
  lineHeight: 1.6,
  wordBreak: 'break-word',
});

export const githubSection = style({
  border: '2px solid rgba(99, 102, 241, 0.2)',
  borderRadius: '10px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '6px',
  flexShrink: 0,
  marginLeft: 'auto',
  padding: '12px',
  cursor: 'pointer',
  textDecoration: 'none',
  transition: 'transform 0.2s',

  ':hover': {
    transform: 'scale(1.05)',
  },

  ':active': {
    transform: 'scale(0.98)',
  },
});

export const githubIcon = style({
  fontSize: '32px',
  color: cssVarV2.icon.primary,
  opacity: 0.8,
  transition: 'opacity 0.2s',

  selectors: {
    [`${developmentBanner}:hover &`]: {
      opacity: 1,
    },
  },
});

export const githubText = style({
  fontSize: '12px',
  color: cssVarV2.text.tertiary,
  fontWeight: 500,
  whiteSpace: 'nowrap',
  letterSpacing: '0.2px',

  selectors: {
    [`${githubSection}:hover &`]: {
      color: cssVarV2.text.secondary,
    },
  },
});
