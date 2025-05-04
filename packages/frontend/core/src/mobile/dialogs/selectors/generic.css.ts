import {
  bodyEmphasized,
  bodyRegular,
  footnoteRegular,
  subHeadlineRegular,
} from '@toeverything/theme/typography';
import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

const flexCenter = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const root = style({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
});

// header
export const headerTitle = style([
  bodyEmphasized,
  {
    color: cssVarV2('text/primary'),
  },
]);
export const scrollArea = style({
  height: 0,
  flex: 1,
});

// content
export const list = style({
  padding: '0 8px',
  position: 'relative',
});
export const quickSelect = style({
  width: 32 + 8 * 2,
  height: '100%',
  position: 'absolute',
  top: 0,
  left: 0,
});
export const listItem = style({
  display: 'flex',
  alignItems: 'center',
  padding: 8,
  gap: 12,
  borderBottom: `0.5px solid ${cssVarV2('layer/insideBorder/border')}`,
});
export const listItemCheckbox = style([
  flexCenter,
  {
    width: 32,
    height: 32,
    fontSize: 24,
    color: cssVarV2('icon/primary'),
  },
]);
export const listItemIcon = style([
  flexCenter,
  {
    width: 32,
    height: 32,
    fontSize: 24,
    color: cssVarV2('icon/primary'),
  },
]);
export const listItemLabel = style([
  bodyRegular,
  {
    color: cssVarV2('text/primary'),
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: 0,
    flex: 1,
  },
]);
export const listItemArrow = style({
  fontSize: 16,
  color: cssVarV2('icon/disable'),
});

// footer
export const footer = style({
  padding: '0 16px',
  borderTop: `1px solid ${cssVarV2('layer/insideBorder/border')}`,
});
export const actions = style({
  width: '100%',
  padding: '8px 16px',
});
export const actionButton = style({
  width: '100%',
  height: 44,
  borderRadius: 8,

  fontSize: 17,
  fontWeight: 400,
  letterSpacing: -0.43,
});

export const changedInfo = style([
  subHeadlineRegular,
  {
    color: cssVarV2('text/primary'),
    height: 20,
  },
]);
export const totalInfo = style([
  footnoteRegular,
  {
    color: cssVarV2('text/tertiary'),
    height: 18,
  },
]);
export const info = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: 0,
  gap: 8,
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  selectors: {
    [`&:has(> ${changedInfo}), &:has(> ${totalInfo})`]: {
      padding: '8px 0',
    },
    [`&:has(> ${totalInfo})`]: {
      height: 18 + 8 * 2,
    },
    [`&:has(> ${changedInfo})`]: {
      height: 20 + 8 * 2,
    },
    [`&:has(> ${changedInfo}):has(> ${totalInfo})`]: {
      height: 20 + 18 + 8 + 8 * 2,
    },
  },
});
