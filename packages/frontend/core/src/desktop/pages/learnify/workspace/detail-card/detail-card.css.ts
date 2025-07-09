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
  boxShadow: cssVarV2.shadow.shadow1,
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
    borderColor: cssVarV2.button.default.borderHover,
  },

  ':disabled': {
    cursor: 'not-allowed',
  },

  selectors: {
    '&[data-selected="true"]': {
      borderColor: cssVarV2.button.primary.background,
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
