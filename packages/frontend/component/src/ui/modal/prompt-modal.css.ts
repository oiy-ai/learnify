import { cssVar } from '@toeverything/theme';
import { style } from '@vanilla-extract/css';

// desktop
export const desktopStyles = {
  container: style({
    display: 'flex',
    flexDirection: 'column',
  }),
  description: style({}),
  header: style({}),
  content: style({
    height: '100%',
    overflowY: 'auto',
    padding: '12px 4px 20px 4px',
  }),
  label: style({
    color: cssVar('textSecondaryColor'),
    fontSize: 14,
    lineHeight: '22px',
    padding: '8px 0',
  }),
  input: style({}),
  inputContainer: style({}),
  footer: style({
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: '40px',
    marginTop: 'auto',
    gap: '20px',
    selectors: {
      '&.modalFooterWithChildren': {
        paddingTop: '20px',
      },
      '&.reverse': {
        flexDirection: 'row-reverse',
        justifyContent: 'flex-start',
      },
    },
  }),
  action: style({}),
};

// mobile
export const mobileStyles = {
  container: style({
    display: 'flex',
    flexDirection: 'column',
    padding: '12px 0 !important',
    borderRadius: 22,
  }),
  description: style({
    padding: '11px 22px',
    fontSize: 17,
    fontWeight: 400,
    letterSpacing: -0.43,
    lineHeight: '22px',
  }),
  label: style({
    color: cssVar('textSecondaryColor'),
    fontSize: 14,
    lineHeight: '22px',
    padding: '8px 16px',
  }),
  header: style({
    padding: '10px 16px',
    marginBottom: '0px !important',
    fontSize: 17,
    fontWeight: 600,
    letterSpacing: -0.43,
    lineHeight: '22px',
  }),
  inputContainer: style({
    padding: '0 16px',
  }),
  input: style({
    height: 44,
    fontSize: 17,
    lineHeight: '22px',
  }),
  content: style({
    padding: '11px 22px',
    fontSize: 17,
    fontWeight: 400,
    letterSpacing: -0.43,
    lineHeight: '22px',
  }),
  footer: style({
    padding: '8px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    selectors: {
      '&.reverse': {
        flexDirection: 'column-reverse',
      },
    },
  }),
  action: style({
    width: '100%',
    height: 44,
    borderRadius: 8,
    fontSize: 17,
    fontWeight: 400,
    letterSpacing: -0.43,
    lineHeight: '22px',
  }),
};
