import { cssVar } from '@toeverything/theme';
import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

const width = 440;

export const root = style({
  background: cssVarV2('layer/background/primary'),
  borderRadius: '8px',
  border: `1px solid ${cssVarV2('layer/insideBorder/border')}`,
  cursor: 'default',
  padding: '12px 10px',
  boxShadow: cssVar('shadow1'),
  display: 'flex',
  gap: 8,
  position: 'fixed',
  bottom: 16,
  left: `calc(50dvw - ${width / 2}px)`,
  width,
  zIndex: cssVar('zIndexPopover'),
  transition: 'transform 0.2s ease-in-out',
  selectors: {
    '&[data-hidden="true"]': {
      transform: 'translateY(200%)',
    },
  },
});

export const pane = style({
  padding: '10px 12px',
  display: 'flex',
  flexDirection: 'column',
  rowGap: 6,
  selectors: {
    '&:not(:last-of-type)': {
      borderBottom: `1px solid ${cssVarV2('layer/insideBorder/border')}`,
    },
  },
});

export const buttonGroup = style({
  display: 'flex',
  gap: 4,
  justifyContent: 'flex-end',
});

export const button = style({
  height: 26,
  borderRadius: 8,
  padding: '0 12px',
  fontSize: cssVar('fontXs'),
});

export const titleRow = style({
  display: 'inline-flex',
  alignItems: 'center',
  fontSize: cssVar('fontSm'),
  color: cssVarV2('text/primary'),
  fontWeight: 500,
});

export const subtitleRow = style({
  fontSize: cssVar('fontXs'),
  color: cssVarV2('text/primary'),
  marginTop: 4,
});

export const controlsRow = style({
  display: 'flex',
  alignItems: 'center',
  marginTop: 8,
});

export const rememberLabel = style({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  fontWeight: 500,
  fontSize: cssVar('fontXs'),
  cursor: 'pointer',
});

export const rememberCheckbox = style({
  width: 20,
  height: 20,
  flexShrink: 0,
  fontSize: 20,
  color: cssVarV2('icon/primary'),
});

export const closeButton = style({
  width: 24,
  height: 24,
  flexShrink: 0,
  fontSize: 24,
});

export const contentCol = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  flex: 1,
});

export const appIconCol = style({
  display: 'flex',
  justifyContent: 'flex-start',
});

export const appIcon = style({
  width: 48,
  height: 48,
  flexShrink: 0,
});

export const spacer = style({
  flex: 1,
});

export const link = style({
  color: cssVarV2('text/link'),
  textDecoration: 'underline',
});
