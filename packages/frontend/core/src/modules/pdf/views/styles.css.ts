import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const virtuoso = style({
  width: '100%',
});

export const virtuosoList = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 'calc(100% - 40px)',
  gap: '20px',
  selectors: {
    '&.small-gap': {
      gap: '12px',
    },
  },
});

export const virtuosoItem = style({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const pdfPageError = style({
  display: 'flex',
  alignSelf: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  textWrap: 'wrap',
  width: '100%',
  wordBreak: 'break-word',
  fontSize: 14,
  lineHeight: '22px',
  fontWeight: 400,
  color: cssVarV2('text/primary'),
});

export const pdfPageCanvas = style({
  maxWidth: '100%',
});

export const pdfLoading = style({
  display: 'flex',
  alignSelf: 'center',
  width: '179.66px',
  height: '253px',
  aspectRatio: '539 / 759',
  overflow: 'hidden',
});
