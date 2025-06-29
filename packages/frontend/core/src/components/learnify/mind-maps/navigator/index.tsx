import { useTheme } from 'next-themes';

import * as styles from './index.css';

export const MindMapsNavigator = () => {
  const { resolvedTheme } = useTheme();
  const lightImage =
    'https://cdn.jsdelivr.net/gh/a1exsun/file@main//hexo/20250505154900908.png';
  const darkImage =
    'https://cdn.jsdelivr.net/gh/a1exsun/file@main//hexo/20250505173403971.png';

  return (
    <div className={styles.root}>
      <img
        src={resolvedTheme === 'dark' ? darkImage : lightImage}
        alt="Mind Map Navigator"
        className={styles.image}
      />
    </div>
  );
};
