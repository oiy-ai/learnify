import { bodyRegular } from '@toeverything/theme/typography';
import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const root = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  position: 'relative',
});
export const label = style([
  bodyRegular,
  { color: cssVarV2('text/placeholder') },
]);
export const icon = style({
  fontSize: 24,
  color: cssVarV2('icon/primary'),
});
export const nativeSelect = style({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  opacity: 0,
});
