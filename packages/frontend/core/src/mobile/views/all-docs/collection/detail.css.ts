import { bodyEmphasized } from '@toeverything/theme/typography';
import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const header = style({
  background: cssVarV2.layer.background.mobile.primary,
});

export const headerContent = style([
  bodyEmphasized,
  {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: cssVarV2('text/primary'),
  },
]);

export const headerIcon = style({
  fontSize: 24,
  color: cssVarV2('icon/primary'),
});
