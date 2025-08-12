import { useI18n } from '@affine/i18n';
import { GithubIcon } from '@blocksuite/icons/rc';
import { memo, useCallback, useState } from 'react';

import * as styles from './development-banner.css';

export const BillingDevelopmentBanner = memo(
  function BillingDevelopmentBanner() {
    const [isHovered, setIsHovered] = useState(false);
    const t = useI18n();

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
            <span className={styles.bannerIcon}>💳</span>
          </div>
          <div className={styles.bannerText}>
            <div className={styles.bannerTitle}>
              {t['com.affine.payment.billing-setting.development.title']()}
            </div>
            <div className={styles.bannerDescription}>
              {t[
                'com.affine.payment.billing-setting.development.description'
              ]()}
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
            <span className={styles.githubText}>
              {t['com.affine.payment.billing-setting.development.github']()}
            </span>
          </a>
        </div>
      </div>
    );
  }
);
