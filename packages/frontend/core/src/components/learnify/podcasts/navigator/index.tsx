import { Button } from '@affine/component';
import { WorkbenchService } from '@affine/core/modules/workbench';
import { useI18n } from '@affine/i18n';
import {
  ArrowLeftSmallIcon,
  ArrowRightSmallIcon,
  HeadphonePanelIcon,
  PausePanelIcon,
  PlayPanelIcon,
} from '@blocksuite/icons/rc';
import { useService } from '@toeverything/infra';
import { useTheme } from 'next-themes';
import { useCallback, useState } from 'react';

import * as styles from './index.css';

export const PodcastsNavigator = () => {
  const { resolvedTheme } = useTheme();
  const workbench = useService(WorkbenchService).workbench;
  const t = useI18n();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime] = useState(45);
  const totalTime = 180;

  const handleNavigateToPodcasts = useCallback(() => {
    workbench.openPodcasts();
  }, [workbench]);

  const togglePlay = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.root} data-theme={resolvedTheme}>
        <div className={styles.playerContainer}>
          <div className={styles.topSection}>
            <div className={styles.albumArt}>
              <HeadphonePanelIcon className={styles.albumIcon} />
            </div>
            <div className={styles.playerInfo}>
              <div className={styles.podcastTitle}>
                {t['com.learnify.podcasts.player.title']()}
              </div>
              <div className={styles.podcastAuthor}>
                {t['com.learnify.podcasts.player.author']()}
              </div>
            </div>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${(currentTime / totalTime) * 100}%` }}
            />
          </div>
          <div className={styles.timeInfo}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(totalTime)}</span>
          </div>
          <div className={styles.playerControls}>
            <button className={styles.controlButton}>
              <ArrowLeftSmallIcon className={styles.controlIcon} />
            </button>
            <button className={styles.playButton} onClick={togglePlay}>
              {isPlaying ? (
                <PausePanelIcon className={styles.playIcon} />
              ) : (
                <PlayPanelIcon className={styles.playIcon} />
              )}
            </button>
            <button className={styles.controlButton}>
              <ArrowRightSmallIcon className={styles.controlIcon} />
            </button>
          </div>
        </div>
      </div>
      <Button
        className={styles.floatingButton}
        onClick={handleNavigateToPodcasts}
        prefix={<HeadphonePanelIcon />}
      >
        {t['com.learnify.podcasts.go-to-podcasts']()}
      </Button>
      <div className={styles.overlay} data-theme={resolvedTheme}>
        <div className={styles.overlayText}>
          {t['com.learnify.podcasts.feature-in-development']()}
        </div>
      </div>
    </div>
  );
};
