import { cssVar } from '@toeverything/theme';
import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const progressRoot = style({
  paddingRight: 12,
});

export const progressInfoRow = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: 4,
});
export const progressName = style([
  { fontSize: cssVar('fontSm'), color: cssVarV2('text/primary') },
]);
export const progressDesc = style([
  { fontSize: cssVar('fontXs'), color: cssVarV2('text/secondary') },
]);
export const progressTrack = style({
  width: '100%',
  height: 10,
  borderRadius: 5,
  backgroundColor: cssVarV2('layer/background/hoverOverlay'),
  overflow: 'hidden',
});
export const progressBar = style({
  height: 'inherit',
  borderTopRightRadius: 5,
  borderBottomRightRadius: 5,
});

export const root = style({
  borderRadius: '8px',
  width: '100%',
  padding: '0px 8px',
  display: 'flex',
  flexDirection: 'column',
});

export const infoRow = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
});

export const name = style({
  fontSize: cssVar('fontXs'),
  fontWeight: 500,
});

export const desc = style({
  fontSize: 14,
  color: cssVar('textSecondaryColor'),
});

export const track = style({
  width: '100%',
  height: 8,
  backgroundColor: cssVar('backgroundTertiaryColor'),
  borderRadius: 4,
  overflow: 'hidden',
});

export const bar = style({
  height: '100%',
  borderRadius: 4,
  transition: 'width 0.3s ease',
});

export const progressItem = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  padding: 8,
  fontWeight: 500,
});

export const title = style({
  fontSize: 14,
  fontWeight: 500,
});
