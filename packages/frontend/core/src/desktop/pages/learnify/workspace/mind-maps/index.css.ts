import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const scrollArea = style({
  width: '100%',
  flexGrow: 1,
  height: 0,
});

export const collectionHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '24px',
});

export const breadcrumb = style({
  fontSize: 14,
  lineHeight: '22px',
  color: cssVarV2.text.secondary,
  display: 'flex',
  alignItems: 'center',
});
export const breadcrumbItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  cursor: 'pointer',
  selectors: {
    '&[data-active="true"]': {
      color: cssVarV2.text.primary,
      cursor: 'default',
    },
  },
});
export const breadcrumbLink = style({
  color: 'inherit',
  textDecoration: 'none',
});
export const breadcrumbIcon = style({
  fontSize: 20,
  color: cssVarV2.icon.primary,
});
export const breadcrumbSeparator = style({
  marginLeft: 4,
  marginRight: 8,
});

export const headerActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: 16,
});

export const newPageButtonText = style({
  fontSize: 12,
  lineHeight: '20px',
  fontWeight: 500,
});

export const editorPlaceholder = style({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 16,
});

export const placeholderContent = style({
  textAlign: 'center',
  color: cssVarV2.text.secondary,
});

export const placeholderText = style({
  fontSize: 14,
  lineHeight: '22px',
  color: cssVarV2.text.secondary,
});

export const rightPanel = style({
  margin: '16px 16px 16px 0',
  border: `1px solid ${cssVarV2.layer.insideBorder.border}`,
  borderRadius: 16,
  backgroundColor: cssVarV2.layer.background.primary,
});

export const mindMapEditorWrapper = style({
  width: '100%',
  height: '100%',
  borderRadius: 16,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
});

export const zoomToolbar = style({
  position: 'absolute',
  bottom: 16,
  left: 16,
  zIndex: 10,
});

export const editButton = style({
  position: 'absolute',
  bottom: 20,
  right: 16,
  zIndex: 10,

  borderRadius: 8,
});
