import { cssVar } from '@toeverything/theme';
import { createVar, style } from '@vanilla-extract/css';

export const switchHeightVar = createVar('switchSize');
export const switchPaddingVar = createVar('switchPadding');
const switchWidthVar = createVar('switchWidth');
const dotSizeVar = createVar('dotSize');

export const labelStyle = style({
  vars: {
    [switchHeightVar]: '26px',
    [switchPaddingVar]: '3px',
    [switchWidthVar]: `calc((${switchHeightVar} - ${switchPaddingVar}) * 2)`,
    [dotSizeVar]: `calc(${switchHeightVar} - ${switchPaddingVar} * 2)`,
  },
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  cursor: 'pointer',
});
export const inputStyle = style({
  opacity: 0,
  position: 'absolute',
});
export const switchStyle = style({
  position: 'relative',
  height: switchHeightVar,
  width: switchWidthVar,
  background: cssVar('toggleDisableBackgroundColor'),
  borderRadius: '37px',
  transition: '200ms all',
  selectors: {
    '&:before': {
      transition: 'all .2s cubic-bezier(0.27, 0.2, 0.25, 1.51)',
      content: '""',
      position: 'absolute',
      width: dotSizeVar,
      height: dotSizeVar,
      borderRadius: '50%',
      top: '50%',
      background: cssVar('toggleCircleBackgroundColor'),
      transform: `translate(${switchPaddingVar}, -50%)`,
    },
  },
});
export const switchCheckedStyle = style({
  background: cssVar('primaryColor'),
  selectors: {
    '&:before': {
      borderColor: cssVar('pureBlack10'),
      transform: `translate(calc(${switchHeightVar} - ${switchPaddingVar}), -50%)`,
    },
  },
});
export const switchDisabledStyle = style({
  cursor: 'not-allowed',
  opacity: 0.5,
});
