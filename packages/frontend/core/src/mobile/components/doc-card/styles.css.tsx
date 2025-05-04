import {
  bodyEmphasized,
  footnoteRegular,
} from '@toeverything/theme/typography';
import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const card = style({
  padding: 16,
  borderRadius: 12,
  border: `0.5px solid ${cssVarV2('layer/insideBorder/border')}`,
  boxShadow: '0px 2px 3px rgba(0,0,0,0.05)',
  background: cssVarV2('layer/background/mobile/secondary'),

  display: 'flex',
  flexDirection: 'column',
  gap: 8,

  color: 'unset',
  ':visited': { color: 'unset' },
  ':hover': { color: 'unset' },
  ':active': { color: 'unset' },
});
export const head = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
});
export const title = style([
  bodyEmphasized,
  {
    width: 0,
    flex: 1,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
]);
export const untitled = style({
  opacity: 0.4,
});
export const content = style([
  footnoteRegular,
  {
    overflow: 'hidden',
  },
]);

export const contentEmpty = style({
  opacity: 0.3,
});
