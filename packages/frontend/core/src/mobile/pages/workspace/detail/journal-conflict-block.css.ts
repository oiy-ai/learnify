import {
  bodyRegular,
  subHeadlineEmphasized,
} from '@toeverything/theme/typography';
import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const body = style({
  paddingTop: 8,
});
export const header = style([
  subHeadlineEmphasized,
  {
    height: 42,
    padding: '11px 20px',
    display: 'flex',
    alignItems: 'center',
    color: cssVarV2.button.error,
  },
]);
export const separator = style({
  width: '100%',
  height: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ':before': {
    content: '',
    width: '100%',
    height: 0,
    borderTop: '0.5px solid ' + cssVarV2.layer.insideBorder.border,
  },
});

export const docItem = style({
  padding: '11px 20px',
  height: 44,
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  color: 'unset',
});
export const icon = style({
  fontSize: 20,
  color: cssVarV2.icon.primary,
});
export const content = style({
  width: 0,
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});
export const title = style([
  bodyRegular,
  {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
]);
export const duplicatedTag = style({
  fontSize: 12,
  lineHeight: '20px',
  height: 20,
  padding: '0 8px',
  borderRadius: 4,
  color: cssVarV2.toast.iconState.error,
  backgroundColor: cssVarV2.layer.background.error,
  border: `1px solid ${cssVarV2.database.border}`,
});
export const edit = style({
  fontSize: 20,
  color: cssVarV2.icon.primary,
});
