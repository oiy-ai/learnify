import { cssVar } from '@toeverything/theme';
import { style } from '@vanilla-extract/css';

export const root = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  gap: '20px',
});

export const textContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
});

export const title = style({
  fontSize: cssVar('fontH6'),
  fontWeight: 600,
  lineHeight: '26px',
});

export const description = style({
  fontSize: cssVar('fontBase'),
  fontWeight: 400,
  lineHeight: '24px',
  color: cssVar('textSecondaryColor'),
});

export const serverSelector = style({
  width: '100%',
});

export const button = style({
  width: '100%',
});
