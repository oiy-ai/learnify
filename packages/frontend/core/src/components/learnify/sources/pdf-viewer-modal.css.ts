import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  height: '90%',
  width: '70%',
  overflow: 'hidden',
  backgroundColor: 'var(--affine-background-primary-color)',
  borderRadius: '8px',
});
