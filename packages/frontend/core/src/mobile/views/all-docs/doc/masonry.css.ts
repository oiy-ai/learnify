import { style } from '@vanilla-extract/css';

export const paddingX = 16;
export const columnGap = 17;

export const columns = style({
  padding: `16px ${paddingX}px`,
  display: 'flex',
  gap: columnGap,
});

export const column = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  width: 0,
  flex: 1,
});
