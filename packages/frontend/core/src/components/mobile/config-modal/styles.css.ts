import {
  bodyEmphasized,
  footnoteRegular,
} from '@toeverything/theme/typography';
import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const pageModalContent = style({
  padding: 0,
  overflowY: 'auto',
  backgroundColor: cssVarV2('layer/background/secondary'),
});

export const popupModalContent = style({
  padding: '12px',
});

export const pageTitle = style([
  bodyEmphasized,
  {
    color: cssVarV2('text/primary'),
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
  },
]);

export const popupTitle = style([
  bodyEmphasized,
  {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: cssVarV2('text/primary'),
    padding: '0 8px',
    height: 44,
  },
]);

export const pageContent = style({
  padding: '24px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
});

export const popupContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
});

export const doneButton = style([
  bodyEmphasized,
  {
    color: cssVarV2('button/primary'),
  },
]);

export const bottomDoneButtonContainer = style({
  padding: '4px',
});

export const bottomDoneButton = style({
  width: '100%',
  height: 44,
  fontSize: 17,
  alignSelf: 'center',
});

export const group = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  width: '100%',
});

export const groupTitle = style([
  footnoteRegular,
  {
    color: cssVarV2('text/tertiary'),
    padding: 4,
  },
]);

export const groupContent = style({
  background: cssVarV2('layer/background/primary'),
  borderRadius: 12,
  padding: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

export const rowItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 4px',
});
