import { cssVar } from '@toeverything/theme';
import { style } from '@vanilla-extract/css';

export const userPlanButton = style({
  display: 'flex',
  fontSize: cssVar('fontXs'),
  height: 20,
  fontWeight: 500,
  cursor: 'pointer',
  color: cssVar('pureWhite'),
  backgroundColor: cssVar('brandColor'),
  padding: '0 4px',
  borderRadius: 4,
  justifyContent: 'center',
  alignItems: 'center',

  selectors: {
    '&[data-is-believer="true"]': {
      // TODO(@CatsJuice): this color is new `Figma token` value without dark mode support.
      backgroundColor: '#374151',
    },
  },
});
