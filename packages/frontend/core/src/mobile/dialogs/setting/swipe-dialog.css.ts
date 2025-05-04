import { cssVar } from '@toeverything/theme';
import { bodyEmphasized } from '@toeverything/theme/typography';
import { cssVarV2 } from '@toeverything/theme/v2';
import { createVar, style } from '@vanilla-extract/css';

export const root = style({
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: cssVar('zIndexModal'),
  width: '100dvw',
  height: '100dvh',
});
export const overlay = style({
  position: 'absolute',
  width: '100%',
  height: '100%',
  left: 0,
  top: 0,
  background: 'transparent',
});
export const dialog = style([
  overlay,
  {
    padding: 0,
    background: cssVarV2('layer/background/mobile/primary'),
    // initial state,
    transform: 'translateX(100%)',
  },
]);

export const content = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  height: '100dvh',
});

export const header = style({
  background: `${cssVarV2('layer/background/mobile/primary')} !important`,
});

export const dialogTitle = style([bodyEmphasized, {}]);
export const scrollArea = style({
  height: 0,
  flex: 1,
});

export const triggerSizeVar = createVar('triggerSize');
export const swipeBackTrigger = style({
  position: 'absolute',
  top: 0,
  left: 0,
  width: triggerSizeVar,
  height: '100%',
  zIndex: 1,
});
