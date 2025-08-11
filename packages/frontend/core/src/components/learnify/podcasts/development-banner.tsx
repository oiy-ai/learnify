import { GithubIcon } from '@blocksuite/icons/rc';
import { memo, useCallback, useState } from 'react';

import * as styles from './development-banner.css';

export const DevelopmentBanner = memo(function DevelopmentBanner() {
  const [isHovered, setIsHovered] = useState(false);

  const handleGithubClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    window.open('https://github.com/oiy-ai/learnify', '_blank');
  }, []);

  return (
    <div
      className={styles.developmentBanner}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-hovered={isHovered}
    >
      <div className={styles.bannerContent}>
        <div className={styles.bannerIconWrapper}>
          <span className={styles.bannerIcon}>🚧</span>
        </div>
        <div className={styles.bannerText}>
          <div className={styles.bannerTitle}>Feature Under Development</div>
          <div className={styles.bannerDescription}>
            The podcast feature is currently in development. All data is mock
            data. You can follow the latest progress on GitHub.
          </div>
        </div>
        <a
          href="https://github.com/oiy-ai/learnify"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.githubSection}
          onClick={handleGithubClick}
        >
          <GithubIcon className={styles.githubIcon} />
          <span className={styles.githubText}>Stay tuned on GitHub</span>
        </a>
      </div>
    </div>
  );
});
