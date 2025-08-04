import { style } from '@vanilla-extract/css';

export const modalHeader = style({
  padding: '24px 24px 16px',
  borderBottom: '1px solid var(--affine-border-color)',
});

export const modalTitle = style({
  fontSize: '18px',
  fontWeight: 600,
  marginBottom: '8px',
  color: 'var(--affine-text-primary-color)',
});

export const modalDescription = style({
  fontSize: '14px',
  color: 'var(--affine-text-secondary-color)',
});

export const optionsGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '16px',
  padding: '24px',
});

export const optionCard = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '12px',
  padding: '24px 16px',
  border: '1px solid var(--affine-border-color)',
  borderRadius: '8px',
  background: 'transparent',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  position: 'relative',

  ':hover': {
    borderColor: 'var(--affine-primary-color)',
    background: 'var(--affine-hover-color)',
  },
});

export const optionCardSelected = style({
  borderColor: 'var(--affine-primary-color)',
  background: 'rgba(30, 150, 235, 0.1)', // Light blue background for selected state
});

export const optionIcon = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  background: 'var(--affine-background-secondary-color)',
  fontSize: '24px',
  color: 'var(--affine-icon-color)',
});

export const optionName = style({
  fontSize: '16px',
  fontWeight: 500,
  color: 'var(--affine-text-primary-color)',
});

export const optionDescription = style({
  fontSize: '12px',
  color: 'var(--affine-text-secondary-color)',
  textAlign: 'center',
  maxWidth: '180px',
});

export const modalFooter = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  padding: '16px 24px',
  borderTop: '1px solid var(--affine-border-color)',
});
