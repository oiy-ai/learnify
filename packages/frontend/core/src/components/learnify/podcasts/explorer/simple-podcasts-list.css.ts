import { cssVarV2 } from '@toeverything/theme/v2';
import { globalStyle, style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  padding: '8px',
  height: '100%',
  overflowY: 'auto',
  scrollbarGutter: 'stable',
  scrollbarWidth: 'thin',
  scrollbarColor: `${cssVarV2.scrollBar.thumbColor} transparent`,
});

// Webkit scrollbar styles
globalStyle(`${container}::-webkit-scrollbar`, {
  width: '6px',
});

globalStyle(`${container}::-webkit-scrollbar-thumb`, {
  backgroundColor: 'transparent',
  borderRadius: '3px',
  transition: 'background-color 0.2s',
});

globalStyle(`${container}:hover::-webkit-scrollbar-thumb`, {
  backgroundColor: cssVarV2.scrollBar.thumbColor,
});

globalStyle(`${container}::-webkit-scrollbar-thumb:hover`, {
  backgroundColor: cssVarV2.scrollBar.hoverThumbColor,
});

globalStyle(`${container}::-webkit-scrollbar-track`, {
  backgroundColor: 'transparent',
});

export const item = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '8px 12px',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: 'transparent',
  minHeight: '48px',
  border: '2px solid transparent',

  ':hover': {
    backgroundColor: cssVarV2.layer.background.hoverOverlay,
  },

  selectors: {
    '&[data-selected="true"]': {
      borderColor: cssVarV2.button.primary,
    },
  },
});

export const iconWrapper = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  borderRadius: '6px',
  backgroundColor: cssVarV2.layer.background.secondary,
  flexShrink: 0,
});

export const itemContent = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  minWidth: 0,
  justifyContent: 'center',
});

export const title = style({
  fontSize: '14px',
  fontWeight: 500,
  margin: 0,
  color: cssVarV2.text.primary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flex: 1,
});

export const duration = style({
  fontSize: '14px',
  color: cssVarV2.text.tertiary,
  fontWeight: 400,
  flexShrink: 0,
  marginRight: '8px',
});

export const description = style({
  fontSize: '12px',
  color: cssVarV2.text.secondary,
  margin: 0,
  lineHeight: 1.3,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const itemFooter = style({
  display: 'none', // Hide footer for more compact view
});

export const category = style({
  fontSize: '12px',
  padding: '4px 8px',
  borderRadius: '4px',
  backgroundColor: cssVarV2.layer.background.tertiary,
  color: cssVarV2.text.emphasis,
});

export const date = style({
  fontSize: '12px',
  color: cssVarV2.text.tertiary,
});

export const hostInfo = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  flexShrink: 0,
  marginRight: '12px',
});

export const hostLabel = style({
  fontSize: '12px',
  color: cssVarV2.text.tertiary,
  fontWeight: 400,
});

export const hostNames = style({
  fontSize: '12px',
  color: cssVarV2.text.secondary,
  fontWeight: 400,
  maxWidth: '150px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const actionButtons = style({
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  flexShrink: 0,
});
