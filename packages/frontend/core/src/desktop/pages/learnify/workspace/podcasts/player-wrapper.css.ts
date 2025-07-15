import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const playerWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  gap: '24px',
  padding: '24px',
  backgroundColor: 'var(--affine-background-primary-color)',
  overflow: 'hidden',
});

export const playerContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  padding: '20px',
  borderRadius: '12px',
  backgroundColor: 'var(--affine-background-secondary-color)',
  boxShadow: 'var(--affine-shadow-1)',
});

export const playerHeader = style({
  display: 'flex',
  gap: '16px',
  alignItems: 'center',
});

export const coverImage = style({
  width: '80px',
  height: '80px',
  borderRadius: '8px',
  objectFit: 'cover',
});

export const podcastInfo = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  flex: 1,
});

export const podcastTitle = style({
  fontSize: '18px',
  fontWeight: 600,
  color: 'var(--affine-text-primary-color)',
  margin: 0,
});

export const podcastAuthor = style({
  fontSize: '14px',
  color: 'var(--affine-text-secondary-color)',
  margin: 0,
});

export const playerControls = style({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
});

export const progressContainer = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flex: 1,
});

export const progressBar = style({
  flex: 1,
  height: '4px',
  borderRadius: '2px',
  cursor: 'pointer',
  WebkitAppearance: 'none',
  appearance: 'none',
  backgroundColor: 'var(--affine-hover-color)',
  outline: 'none',

  '::-webkit-slider-thumb': {
    WebkitAppearance: 'none',
    appearance: 'none',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: 'var(--affine-primary-color)',
    cursor: 'pointer',
  },

  '::-moz-range-thumb': {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: 'var(--affine-primary-color)',
    cursor: 'pointer',
    border: 'none',
  },
});

export const timeLabel = style({
  fontSize: '12px',
  color: 'var(--affine-text-secondary-color)',
  minWidth: '45px',
});

export const subtitleContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  flex: 1,
  overflow: 'hidden',
});

export const subtitleHeader = style({
  fontSize: '16px',
  fontWeight: 600,
  color: 'var(--affine-text-primary-color)',
  margin: 0,
});

export const subtitleList = style({
  flex: 1,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  paddingRight: '8px',
});

export const subtitleItem = style({
  fontSize: 24,
  display: 'flex',
  gap: '12px',
  padding: '12px',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  ':hover': {
    backgroundColor: 'var(--affine-hover-color)',
  },
});

export const activeSubtitle = style({
  color: cssVarV2.button.primary,
  ':hover': {
    backgroundColor: 'var(--affine-hover-color)',
  },
});

export const subtitleTime = style({
  alignSelf: 'center',
  fontSize: 'var(--affine-font-sm)',
  fontWeight: 500,
  minWidth: '50px',
  opacity: 0.8,
});

export const subtitleText = style({
  fontSize: 20,
  lineHeight: 1.5,
  flex: 1,
});

export const currentSubtitle = style({
  padding: '20px',
  borderRadius: '12px',
  backgroundColor: 'var(--affine-background-overlay-panel-color)',
  border: '2px solid var(--affine-primary-color)',
  marginTop: '16px',

  '& p': {
    margin: 0,
    fontSize: '16px',
    lineHeight: 1.6,
    color: 'var(--affine-text-primary-color)',
    textAlign: 'center',
  },
});
