import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const flashcardContainer = style({
  display: 'flex',
  flexDirection: 'column',
  padding: '12px',
  fontSize: '14px',
  minHeight: '120px',
  maxHeight: '100%',
  height: '100%',
  justifyContent: 'space-between',
  overflow: 'hidden',
});

export const flashcardQuestion = style({
  marginBottom: '16px',
  fontWeight: '500',
  lineHeight: '1.5',
  color: cssVarV2('text/primary'),
  flex: '1 1 auto',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
});

export const flashcardOptionsContainer = style({
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
  flexShrink: 0,
  marginTop: 'auto',
});

export const flashcardOption = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px 12px',
  fontSize: '12px',
  fontWeight: '500',
  lineHeight: '20px',
  border: `1px solid ${cssVarV2.layer.insideBorder.border}`,
  borderRadius: '6px',
  backgroundColor: cssVarV2('button/secondary'),
  color: cssVarV2('text/primary'),
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  textAlign: 'center',
  userSelect: 'none',
  position: 'relative',
  flex: '1 1 calc(50% - 4px)',
  minWidth: 0,

  // hover layer
  ':before': {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '100%',
    transition: 'inherit',
    borderRadius: 'inherit',
    opacity: 0,
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: cssVarV2('layer/background/hoverOverlay'),
    borderColor: 'transparent',
    pointerEvents: 'none',
    borderWidth: 'inherit',
    borderStyle: 'inherit',
  },

  selectors: {
    '&:hover:before': {
      opacity: 1,
    },
    '&:hover': {
      borderColor: cssVarV2.layer.insideBorder.blackBorder,
    },
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.8,
    },
    '&[data-correct="true"]': {
      borderColor: cssVarV2('status/success'),
      backgroundColor: cssVarV2('layer/background/success'),
    },
    '&[data-wrong="true"]': {
      borderColor: cssVarV2('status/error'),
      backgroundColor: cssVarV2('layer/background/error'),
    },
    '&[data-selected="true"]:not([data-correct="true"]):not([data-wrong="true"])':
      {
        borderColor: cssVarV2.layer.insideBorder.blackBorder,
      },
  },
});

export const resultIcon = style({
  marginLeft: '4px',
  fontSize: '14px',
  fontWeight: 'bold',
});
