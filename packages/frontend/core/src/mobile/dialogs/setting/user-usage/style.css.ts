import { bodyRegular, caption1Regular } from '@toeverything/theme/typography';
import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const progressRoot = style({});
export const progressInfoRow = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: 4,
});
export const progressName = style([
  bodyRegular,
  { color: cssVarV2('text/primary') },
]);
export const progressDesc = style([
  caption1Regular,
  { color: cssVarV2('text/secondary') },
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
