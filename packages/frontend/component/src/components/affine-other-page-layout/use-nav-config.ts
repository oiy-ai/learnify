import { useI18n } from '@affine/i18n';
import { useMemo } from 'react';

export const useNavConfig = () => {
  const t = useI18n();
  return useMemo(
    () => [
      {
        title: t['com.affine.other-page.nav.official-website'](),
        path: 'https://learnify.oiy.ai',
      },
      {
        title: t['com.affine.other-page.nav.blog'](),
        path: 'https://learnify.oiy.ai/blog',
      },
    ],
    [t]
  );
};
