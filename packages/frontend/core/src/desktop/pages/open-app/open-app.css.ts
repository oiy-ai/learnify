import { cssVar } from '@toeverything/theme';
import { style } from '@vanilla-extract/css';
export const root = style({
  height: '100vh',
  width: '100vw',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: cssVar('fontBase'),
  position: 'relative',
});
export const affineLogo = style({
  color: 'inherit',
});
export const topNav = style({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 120px',
});
export const topNavLinks = style({
  display: 'flex',
  columnGap: 4,
});
export const topNavLink = style({
  color: cssVar('textPrimaryColor'),
  fontSize: cssVar('fontSm'),
  fontWeight: 500,
  textDecoration: 'none',
  padding: '4px 18px',
});

export const promptLinks = style({
  display: 'flex',
  columnGap: 16,
});
export const promptLink = style({
  color: cssVar('linkColor'),
  fontWeight: 500,
  textDecoration: 'none',
  fontSize: cssVar('fontSm'),
});
export const centerContent = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginTop: 40,
});
export const prompt = style({
  marginTop: 20,
  marginBottom: 12,
});
export const editSettingsLink = style({
  fontWeight: 500,
  textDecoration: 'none',
  color: cssVar('linkColor'),
  fontSize: cssVar('fontSm'),
  position: 'absolute',
  bottom: 48,
});
