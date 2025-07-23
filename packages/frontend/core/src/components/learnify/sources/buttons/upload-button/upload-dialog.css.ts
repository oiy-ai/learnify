import { cssVar } from '@toeverything/theme';
import { style } from '@vanilla-extract/css';

export const menuContent = style({
  padding: '8px',
  backgroundColor: cssVar('backgroundOverlayPanelColor'),
  borderRadius: '8px',
  minWidth: '240px',
  maxWidth: '360px',
  boxShadow: cssVar('shadow1'),
});

export const menuItem = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  padding: '8px 12px',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'background-color 0.15s ease',

  ':hover': {
    backgroundColor: cssVar('backgroundSecondaryColor'),
  },
});

export const menuIcon = style({
  width: '20px',
  height: '20px',
  color: cssVar('iconColor'),
  flexShrink: 0,
  marginTop: '2px',
});

export const menuItemContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  flex: 1,
});

export const menuItemTitle = style({
  fontSize: '14px',
  lineHeight: '20px',
  fontWeight: 500,
  color: cssVar('textPrimaryColor'),
});

export const menuItemDescription = style({
  fontSize: '12px',
  lineHeight: '16px',
  color: cssVar('textSecondaryColor'),
});
