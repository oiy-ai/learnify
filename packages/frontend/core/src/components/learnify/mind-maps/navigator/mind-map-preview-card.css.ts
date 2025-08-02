import { style } from '@vanilla-extract/css';

export const previewContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  height: '100%',
  width: '100%',
  padding: '16px',
  overflow: 'hidden',
  position: 'relative',
});

export const mindMapTitle = style({
  fontSize: '16px',
  fontWeight: 600,
  color: 'var(--affine-text-primary-color)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  zIndex: 1,
});

export const previewWindow = style({
  position: 'relative',
  width: '100%',
  flex: 1,
  overflow: 'hidden',
  borderRadius: '8px',
});

export const editorContainer = style({
  height: '120%',
  width: '120%',
  overflow: 'hidden',
  position: 'absolute',
  borderRadius: '8px',
  border: '1px solid var(--affine-border-color)',
  backgroundColor: 'var(--affine-background-primary-color)',
  // Center the container
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
});

export const editor = style({
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  userSelect: 'none',
});

export const loadingContainer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  padding: '40px',
});

export const loadingText = style({
  fontSize: '14px',
  color: 'var(--affine-text-secondary-color)',
});

export const emptyPreview = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  padding: '40px',
  textAlign: 'center',
});

export const emptyText = style({
  fontSize: '16px',
  fontWeight: 500,
  color: 'var(--affine-text-primary-color)',
  marginBottom: '8px',
});

export const emptySubtext = style({
  fontSize: '14px',
  color: 'var(--affine-text-secondary-color)',
});
