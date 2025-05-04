import { style } from '@vanilla-extract/css';

export const monthViewClip = style({
  width: '100%',
  height: '100%',
  overflow: 'hidden',
});

export const monthsSwipe = style({
  width: '300%',
  height: '100%',
  marginLeft: '-100%',
  display: 'flex',
  justifyContent: 'center',
});

export const monthView = style({
  width: 0,
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  padding: '0 16px',
});
