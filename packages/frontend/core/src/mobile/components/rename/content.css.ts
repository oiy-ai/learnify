import { bodyRegular } from '@toeverything/theme/typography';
import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const inputWrapper = style({
  padding: '4px 12px',
  display: 'flex',
  alignItems: 'center',
  gap: 10,
});
export const input = style({
  width: '100%',
  height: 42,
  border: '1px solid ' + cssVarV2('input/border/active'),
  borderRadius: 8,
  padding: '0 4px',
});
export const desc = style([
  bodyRegular,
  {
    padding: '11px 16px',
    color: cssVarV2('text/secondary'),
  },
]);
export const doneWrapper = style({
  width: '100%',
  padding: '8px 16px',
});
export const done = style([
  bodyRegular,
  {
    width: '100%',
    borderRadius: 8,
  },
]);
