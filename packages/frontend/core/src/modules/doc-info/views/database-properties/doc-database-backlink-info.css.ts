import { cssVar } from '@toeverything/theme';
import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const root = style({
  display: 'flex',
  flexDirection: 'column',
});

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
});

export const cell = style({
  display: 'flex',
});

export const divider = style({
  margin: '8px 0',
});

export const spacer = style({
  flex: 1,
});

export const docRefLink = style({
  maxWidth: '50%',
  fontSize: cssVar('fontSm'),
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: cssVarV2('text/tertiary'),
});

export const mobileDocRefLink = style([
  docRefLink,
  {
    maxWidth: '110px',
    minWidth: '60px',
  },
]);

export const cellList = style({
  padding: '0 2px',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
});

export const databaseNameWrapper = style({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  overflow: 'hidden',
});

export const databaseName = style({
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  display: 'inline-block',
});
