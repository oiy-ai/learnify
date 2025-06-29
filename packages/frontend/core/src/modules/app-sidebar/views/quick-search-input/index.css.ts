import { cssVar } from '@toeverything/theme';
import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';
export const root = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: '4px',
  fontSize: cssVar('fontSm'),
  width: '100%',
  height: '30px',
  userSelect: 'none',
  cursor: 'pointer',
  padding: '0 4px 0 8px',
  position: 'relative',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  ':hover': {
    background: cssVarV2('layer/background/hoverOverlay'),
  },
});
export const icon = style({
  color: cssVarV2('icon/primary'),
  fontSize: '20px',
});
export const spacer = style({
  flex: 1,
});
export const shortcutHint = style({
  color: cssVarV2('text/tertiary'),
  fontSize: cssVar('fontBase'),
});
export const quickSearchBarEllipsisStyle = style({
  color: cssVarV2('text/secondary'),
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});
