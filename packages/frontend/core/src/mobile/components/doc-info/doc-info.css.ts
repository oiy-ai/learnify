import { cssVar } from '@toeverything/theme';
import { cssVarV2 } from '@toeverything/theme/v2';
import { globalStyle, style } from '@vanilla-extract/css';

export const scrollableRoot = style({
  padding: '0 16px',
  display: 'flex',
  flexDirection: 'column',
});

export const linksRow = style({});

export const timeRow = style({});
export const scrollBar = style({
  width: 6,
  transform: 'translateX(-4px)',
});

export const tableBodyRoot = style({
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
});
export const addPropertyButton = style({
  alignSelf: 'flex-start',
  fontSize: cssVar('fontSm'),
  color: `${cssVarV2('text/secondary')}`,
  padding: '0 4px',
  height: 36,
  fontWeight: 400,
  gap: 6,
  '@media': {
    print: {
      display: 'none',
    },
  },
  selectors: {
    [`[data-property-collapsed="true"] &`]: {
      display: 'none',
    },
  },
});
globalStyle(`${addPropertyButton} svg`, {
  fontSize: 16,
  color: cssVarV2('icon/secondary'),
});
globalStyle(`${addPropertyButton}:hover svg`, {
  color: cssVarV2('icon/primary'),
});
