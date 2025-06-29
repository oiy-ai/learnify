import { cssVar } from '@toeverything/theme';
import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const featurePanelWrapper = style({
  border: `1px solid ${cssVarV2('layer/insideBorder/border')}`,
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  marginTop: 8,
});

export const tabsWrapper = style({
  padding: 8,
});

export const tabsListCustom = style({
  gap: 10,
  textAlign: 'center',
  justifyContent: 'center',
});

export const tabsContentWrapper = style({
  borderRadius: 8,
});

export const progressWrapper = style({
  display: 'flex',
  alignItems: 'center',
  marginTop: 8,
  border: `1px solid ${cssVarV2('layer/insideBorder/border')}`,
  borderRadius: 8,
  padding: 8,
});

export const navigationWrapper = style({
  display: 'flex',
  alignItems: 'center',
});

export const referenceWrapper = style({
  display: 'flex',
  alignItems: 'center',
  marginTop: 8,
  gap: 8,
  padding: '4px 0',
});

export const referenceHeader = style({
  paddingLeft: 2,
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  fontSize: cssVar('fontBase'),
  fontWeight: 600,
  color: cssVarV2('text/tertiary'),
  height: 30,
  borderBottom: `1px solid ${cssVarV2('layer/insideBorder/border')}`,
});

export const scrollableWrapper = style({
  margin: '0 14px',
});

export const workspaceAndUserWrapper = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  width: '100%',
  height: 42,
  alignSelf: 'center',
});
export const quickSearchAndNewPage = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '4px 0',
  marginLeft: -4,
  marginRight: -4,
});
export const quickSearch = style({
  height: 34,
  width: 95,
  flex: 1,
  border: `1px solid ${cssVarV2('layer/insideBorder/border')}`,
  boxShadow: cssVar('buttonShadow'),
});

export const workspaceWrapper = style({
  width: 0,
  flex: 1,
});

export const bottomContainer = style({
  gap: 8,
});
