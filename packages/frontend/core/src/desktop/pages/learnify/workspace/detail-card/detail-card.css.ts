import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const container = style({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: cssVarV2.layer.background.primary,
  padding: '24px',
  maxWidth: '800px',
  margin: '0 auto',
  width: '100%',
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '32px',
});

export const cardCounter = style({
  fontSize: '14px',
  color: cssVarV2.text.secondary,
  fontWeight: 500,
});

export const cardContainer = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: '48px',
});

export const card = style({
  backgroundColor: cssVarV2.layer.background.secondary,
  borderRadius: '12px',
  padding: '48px',
  boxShadow: cssVarV2.layer.background.primary,
  border: `1px solid ${cssVarV2.layer.insideBorder.border}`,
});

export const question = style({
  fontSize: '24px',
  lineHeight: '1.5',
  fontWeight: 600,
  color: cssVarV2.text.primary,
  marginBottom: '32px',
  textAlign: 'center',
});

export const options = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

export const optionButton = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '16px 20px',
  backgroundColor: cssVarV2.layer.background.primary,
  border: `2px solid ${cssVarV2.layer.insideBorder.border}`,
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontSize: '16px',
  textAlign: 'left',
  width: '100%',
  position: 'relative',

  ':hover': {
    backgroundColor: cssVarV2.layer.background.hoverOverlay,
    borderColor: cssVarV2.button.badgesColor,
  },

  ':disabled': {
    cursor: 'not-allowed',
  },

  selectors: {
    '&[data-selected="true"]': {
      borderColor: cssVarV2.button.primary,
      backgroundColor: cssVarV2.layer.background.hoverOverlay,
    },
    '&[data-correct="true"]': {
      borderColor: cssVarV2.status.success,
      backgroundColor: `${cssVarV2.status.success}10`,
    },
    '&[data-wrong="true"]': {
      borderColor: cssVarV2.status.error,
      backgroundColor: `${cssVarV2.status.error}10`,
    },
  },
});

export const optionKey = style({
  fontWeight: 600,
  color: cssVarV2.text.secondary,
  minWidth: '24px',
});

export const optionText = style({
  textAlign: 'center',
  flex: 1,
  color: cssVarV2.text.primary,
  lineHeight: '1.5',
});

export const resultIcon = style({
  position: 'absolute',
  right: '20px',
  fontSize: '20px',
  fontWeight: 'bold',
  selectors: {
    [`${optionButton}[data-correct="true"] &`]: {
      color: cssVarV2.status.success,
    },
    [`${optionButton}[data-wrong="true"] &`]: {
      color: cssVarV2.status.error,
    },
  },
});

export const resultMessage = style({
  marginTop: '24px',
  padding: '16px',
  borderRadius: '8px',
  textAlign: 'center',
  fontSize: '16px',
  fontWeight: 500,
  backgroundColor: cssVarV2.layer.background.hoverOverlay,
  color: cssVarV2.text.primary,
});

export const navigation = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
});

export const loadingState = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
});

export const errorContainer = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: '48px',
  maxWidth: '600px',
  margin: '0 auto',
});

export const errorIcon = style({
  fontSize: '64px',
  marginBottom: '24px',
});

export const errorTitle = style({
  fontSize: '24px',
  fontWeight: 600,
  color: cssVarV2.text.primary,
  marginBottom: '16px',
});

export const errorMessage = style({
  fontSize: '16px',
  color: cssVarV2.text.secondary,
  lineHeight: '1.6',
  marginBottom: '32px',
});

export const errorHint = style({
  marginBottom: '32px',
  textAlign: 'left',
  width: '100%',
  maxWidth: '500px',
});

export const formatExample = style({
  backgroundColor: cssVarV2.layer.background.secondary,
  border: `1px solid ${cssVarV2.layer.insideBorder.border}`,
  borderRadius: '8px',
  padding: '16px',
  marginTop: '12px',
  fontSize: '14px',
  fontFamily: 'monospace',
  color: cssVarV2.text.primary,
  whiteSpace: 'pre-wrap',
  overflowX: 'auto',
});

export const backButton = style({
  marginTop: '16px',
});

export const navigationHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '24px',
  padding: '0 8px',
});

export const navButton = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 16px',
  backgroundColor: cssVarV2.layer.background.secondary,
  border: `1px solid ${cssVarV2.layer.insideBorder.border}`,
  borderRadius: '8px',
  color: cssVarV2.text.primary,
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  ':hover': {
    backgroundColor: cssVarV2.layer.background.hoverOverlay,
    borderColor: cssVarV2.button.badgesColor,
  },

  ':disabled': {
    cursor: 'not-allowed',
    opacity: 0.5,
    color: cssVarV2.text.disable,
  },

  selectors: {
    '&:disabled:hover': {
      backgroundColor: cssVarV2.layer.background.secondary,
      borderColor: cssVarV2.layer.insideBorder.border,
    },
  },
});
