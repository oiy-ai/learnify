import { useTheme } from 'next-themes';

import demoImage from './demo.png';
import * as styles from './index.css';

export const NotesNavigator = () => {
  const { resolvedTheme } = useTheme();

  return (
    <div className={styles.root} data-theme={resolvedTheme}>
      <img src={demoImage} alt="Notes Navigator" className={styles.image} />
    </div>
  );
};
