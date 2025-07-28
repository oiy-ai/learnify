import { cssVar } from '@toeverything/theme';
import { keyframes, style } from '@vanilla-extract/css';

const rotateGradient = keyframes({
  '0%': {
    transform: 'rotate(0deg)',
  },
  '100%': {
    transform: 'rotate(360deg)',
  },
});

export const toolStyle = style({
  selectors: {
    '&.hide': {
      pointerEvents: 'none',
    },
  },
});

export const aiIslandWrapper = style({
  width: 44,
  height: 44,
  position: 'relative',
  transform: 'translateY(0)',
  transition: 'transform 0.2s ease',

  selectors: {
    '&[data-hide="true"]': {
      transform: 'translateY(120px)',
      transitionDelay: '0.2s',
    },
  },
});
export const aiIslandBtn = style({
  width: 'inherit',
  height: 'inherit',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  color: cssVar('iconColor'),
  boxShadow: '0px 2px 2px rgba(0,0,0,0.05)',
  background: `linear-gradient(${cssVar('backgroundOverlayPanelColor')}, ${cssVar('backgroundOverlayPanelColor')}) padding-box, conic-gradient(from 0deg, #ff0080, #7928ca, #00d4ff, #00ff88, #ffff00, #ff0080) border-box`,
  position: 'relative',

  selectors: {
    [`${aiIslandWrapper}[data-animation="true"] &`]: {
      borderColor: 'transparent',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: '-1px',
      borderRadius: '50%',
      animation: `${rotateGradient} 3s linear infinite`,
      background: `conic-gradient(from 0deg,rgb(154, 149, 210),rgb(138, 210, 224),rgb(198, 219, 156),rgb(233, 231, 126),rgb(254, 159, 148),rgb(239, 171, 197),rgb(188, 166, 231))`,
      zIndex: -1,
    },
    '&:hover::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: '50%',
      background: cssVar('hoverColor'),
      zIndex: 1,
    },
  },
});
