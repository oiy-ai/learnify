import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const previewContainer = style({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: '16px',
  gap: '12px',
});

export const previewHeader = style({
  fontSize: '14px',
  fontWeight: 600,
  color: cssVarV2('text/primary'),
  marginBottom: '4px',
});

export const notesList = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: '8px',
  flex: 1,
});

export const noteItem = style({
  padding: '8px',
  borderRadius: '8px',
  backgroundColor: cssVarV2('layer/background/secondary'),
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  border: `1px solid ${cssVarV2('layer/insideBorder/border')}`,

  ':hover': {
    backgroundColor: cssVarV2('layer/background/hoverOverlay'),
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
});

export const noteTitleRow = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '4px',
  gap: '8px',
});

export const noteTitle = style({
  fontSize: '13px',
  fontWeight: 500,
  color: cssVarV2('text/primary'),
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flex: 1,
});

export const noteTime = style({
  fontSize: '11px',
  color: cssVarV2('text/tertiary'),
  flexShrink: 0,
});

export const noteDescription = style({
  fontSize: '11px',
  color: cssVarV2('text/secondary'),
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const emptyPreview = style({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '20px',
});

export const emptyText = style({
  fontSize: '16px',
  fontWeight: 500,
  color: cssVarV2('text/primary'),
});

export const emptySubtext = style({
  fontSize: '12px',
  color: cssVarV2('text/secondary'),
  textAlign: 'center',
});
