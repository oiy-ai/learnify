import { bodyRegular } from '@toeverything/theme/typography';
import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const dayCell = style([
  bodyRegular,
  {
    position: 'relative',
    height: 34,
    minWidth: 34,
    padding: 4,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    selectors: {
      '&[data-is-today=true]': {},
      '&[data-is-current-month=false]': {
        color: cssVarV2('text/disable'),
      },
      '&[data-is-selected=true]': {
        background: cssVarV2('button/primary'),
        color: cssVarV2('button/pureWhiteText'),
        fontWeight: 600,
      },
    },
  },
]);

export const dot = style({
  position: 'absolute',
  width: 3,
  height: 3,
  borderRadius: 3,
  background: cssVarV2('button/primary'),
  bottom: 3,
  left: '50%',
  transform: 'translateX(-50%)',
});
