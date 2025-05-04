import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const root = style({
  width: '100%',
  borderBottom: `1px solid ${cssVarV2('layer/insideBorder/border')}`,
});

export const weekRow = style({
  padding: '0 16px',
});
export const draggable = style({
  width: '100%',
  padding: '10px 0',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});
export const draggableHandle = style({
  width: 36,
  height: 5,
  borderRadius: 5,
  background: cssVarV2('block/notSupportedBlock/inlineBg/hover'),
});
