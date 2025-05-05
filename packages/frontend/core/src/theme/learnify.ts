import { useTheme } from 'next-themes';

export const lightTheme = {
  successColor: 'rgb(18, 230, 151)',
  successColor1: 'rgb(14, 179, 118)',
  successColor2: 'rgb(10, 128, 84)',
};

// export const darkTheme = {
//   successColor: 'rgb(18, 230, 151)',
//   successColor1: 'rgb(14, 179, 118)',
//   successColor2: 'rgb(10, 128, 84)',
// };

export const darkTheme = {
  successColor: 'rgb(10, 128, 84)',
  successColor1: 'rgb(7, 84, 56)',
  successColor2: 'rgb(5, 66, 44)',
};

export const useLearnifyTheme = () => {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === 'dark' ? darkTheme : lightTheme;
};
