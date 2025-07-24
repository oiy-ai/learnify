import { cssVar } from '@toeverything/theme';
import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const checkbox = style({
  fontSize: 24,
  flexShrink: 0,
  color: cssVarV2('layer/insideBorder/border'),
});

export const sourcesContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  width: 'calc(100% - 6px)',
});

export const sourcesHeader = style({
  fontSize: cssVar('fontSm'),
  fontWeight: 600,
  color: cssVarV2('text/tertiary'),
});

export const sourceCard = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: 8,
  borderRadius: 8,
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
  ':hover': {
    backgroundColor: cssVarV2('layer/background/hoverOverlay'),
  },
});

export const sourceIcon = style({
  width: 24,
  height: 24,
  flexShrink: 0,
  color: cssVarV2('icon/primary'),
});

export const sourceInfo = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  flex: 1,
  minWidth: 0, // This ensures the flex item can shrink below its content size
});

export const sourceName = style({
  fontSize: cssVar('fontSm'),
  fontWeight: 500,
  color: cssVarV2('text/primary'),
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const sourceDescription = style({
  fontSize: cssVar('fontXs'),
  color: cssVarV2('text/secondary'),
});
