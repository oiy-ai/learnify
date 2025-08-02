import { style } from '@vanilla-extract/css';

export const loadingContainer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  minHeight: '300px',
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
  minHeight: '300px',
  gap: '8px',
});

export const emptyText = style({
  fontSize: '16px',
  fontWeight: 500,
  color: 'var(--affine-text-primary-color)',
});

export const emptySubtext = style({
  fontSize: '14px',
  color: 'var(--affine-text-secondary-color)',
});

export const errorContainer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  minHeight: '300px',
});

export const errorText = style({
  fontSize: '14px',
  color: 'var(--affine-error-color)',
});

export const flashcardContainer = style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  padding: '24px',
  backgroundColor: 'var(--affine-background-primary-color)',
  borderRadius: '8px',
});

export const flashcardContent = style({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  gap: '24px',
});

export const question = style({
  fontSize: '20px',
  fontWeight: 600,
  color: 'var(--affine-text-primary-color)',
  textAlign: 'center',
  lineHeight: 1.4,
  maxWidth: '600px',
});

export const showAnswerButton = style({
  padding: '12px 24px',
  backgroundColor: 'var(--affine-primary-color)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.2s',

  ':hover': {
    backgroundColor: 'var(--affine-hover-color)',
    transform: 'translateY(-1px)',
  },

  ':active': {
    transform: 'translateY(0)',
  },
});

export const answerSection = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  width: '100%',
  maxWidth: '600px',
});

export const answerBox = style({
  width: '100%',
  padding: '20px',
  backgroundColor: 'var(--affine-background-secondary-color)',
  borderRadius: '8px',
  border: '1px solid var(--affine-border-color)',
});

export const answerLabel = style({
  fontSize: '14px',
  fontWeight: 600,
  color: 'var(--affine-text-secondary-color)',
  marginBottom: '8px',
});

export const answerText = style({
  fontSize: '16px',
  color: 'var(--affine-text-primary-color)',
  lineHeight: 1.6,
});

export const hideAnswerButton = style({
  padding: '8px 16px',
  backgroundColor: 'transparent',
  color: 'var(--affine-text-secondary-color)',
  border: '1px solid var(--affine-border-color)',
  borderRadius: '6px',
  fontSize: '14px',
  cursor: 'pointer',
  transition: 'all 0.2s',

  ':hover': {
    borderColor: 'var(--affine-primary-color)',
    color: 'var(--affine-primary-color)',
  },
});