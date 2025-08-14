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

export const loadingCardContent = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
  padding: '32px',
});

export const loadingIcon = style({
  fontSize: '36px',
  lineHeight: 1,
});

export const loadingTitle = style({
  fontSize: '18px',
  fontWeight: 600,
  color: 'var(--affine-text-primary-color)',
});

export const loadingSubtext = style({
  fontSize: '14px',
  color: 'var(--affine-text-secondary-color)',
});

export const flashcardContainer = style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  padding: '12px',
  paddingBottom: '36px',
  backgroundColor: 'var(--affine-background-primary-color)',
  borderRadius: '8px',
});

export const flashcardContent = style({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
});

export const question = style({
  fontSize: '20px',
  fontWeight: 600,
  color: 'var(--affine-text-primary-color)',
  textAlign: 'center',
  lineHeight: 1.4,
  maxWidth: '600px',
  maxHeight: '56px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
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
  padding: '8px',
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
  maxHeight: '51px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
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

export const quizOptions = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '8px',
  width: '100%',
  maxWidth: '600px',
});

export const quizOptionButton = style({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  padding: '8px 12px',
  border: '1px solid var(--affine-border-color)',
  borderRadius: '6px',
  backgroundColor: 'var(--affine-background-primary-color)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  textAlign: 'left',
  fontSize: '14px',
  color: 'var(--affine-text-primary-color)',
  minHeight: '40px',
  maxHeight: '60px',
  overflow: 'hidden',

  ':hover': {
    backgroundColor: 'var(--affine-hover-background)',
    borderColor: 'var(--affine-primary-color)',
  },

  ':disabled': {
    cursor: 'default',
  },

  selectors: {
    '&[data-correct="true"]': {
      backgroundColor: 'var(--affine-success-background, #e8f5e9)',
      borderColor: 'var(--affine-success-color, #4caf50)',
      color: 'var(--affine-success-color, #4caf50)',
    },
    '&[data-wrong="true"]': {
      backgroundColor: 'var(--affine-error-background, #ffebee)',
      borderColor: 'var(--affine-error-color, #f44336)',
      color: 'var(--affine-error-color, #f44336)',
    },
    '&[data-selected="true"]:not([data-correct="true"]):not([data-wrong="true"])':
      {
        backgroundColor: 'var(--affine-hover-background)',
        borderColor: 'var(--affine-primary-color)',
      },
  },
});

export const optionText = style({
  flex: 1,
  fontSize: '14px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  wordBreak: 'break-word',
});

export const quizResultMessage = style({
  marginTop: '12px',
  padding: '8px 12px',
  borderRadius: '6px',
  textAlign: 'center',
  fontWeight: 500,
  fontSize: '14px',
  transition: 'all 0.3s ease',

  selectors: {
    '&[data-correct="true"]': {
      backgroundColor: 'var(--affine-success-background, #e8f5e9)',
      color: 'var(--affine-success-color, #4caf50)',
    },
    '&[data-incorrect="true"]': {
      backgroundColor: 'var(--affine-error-background, #ffebee)',
      color: 'var(--affine-error-color, #f44336)',
    },
  },
});
