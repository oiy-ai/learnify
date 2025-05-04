import { cssVar } from '@toeverything/theme';
import { cssVarV2 } from '@toeverything/theme/v2';
import { globalStyle, style } from '@vanilla-extract/css';

export const wrapper = style({
  width: '100%',
  borderRadius: 4,
  color: cssVarV2('text/primary'),
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: 4,
  ':hover': {
    background: cssVarV2('layer/background/hoverOverlay'),
  },
});

globalStyle(`${wrapper} svg`, {
  color: cssVarV2('icon/secondary'),
  fontSize: 16,
  transform: 'none',
});

globalStyle(`${wrapper}:hover svg`, {
  color: cssVarV2('icon/primary'),
});

globalStyle(`${wrapper} span`, {
  fontSize: cssVar('fontSm'),
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  // don't modify border width to avoid layout shift
  borderBottomColor: 'transparent',
});
