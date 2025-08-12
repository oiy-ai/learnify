import { Loading, Modal } from '@affine/component';
import { useI18n } from '@affine/i18n';
import { WarningIcon } from '@blocksuite/icons/rc';
import { useCallback, useEffect, useState } from 'react';

import * as styles from './index.css';

export interface AIGenerationProgress {
  stage: 'preparing' | 'preprocessing' | 'generating' | 'finalizing';
  percentage: number;
  message: string;
  totalItems?: number;
  currentItem?: number;
  currentItemName?: string;
}

export interface AIGenerationOverlayProps {
  open: boolean;
  progress?: AIGenerationProgress;
  error?: Error | null;
  onCancel?: () => void;
  onRetry?: () => void;
}

export const AIGenerationOverlay = ({
  open,
  progress = { stage: 'preparing', percentage: 0, message: '' },
  error,
  onCancel,
  onRetry,
}: AIGenerationOverlayProps) => {
  const t = useI18n();

  const stageMessages = {
    preparing: t['com.learnify.ai-generation.progress.preparing'](),
    preprocessing: t['com.learnify.ai-generation.progress.preprocessing'](),
    generating: t['com.learnify.ai-generation.progress.generating'](),
    finalizing: t['com.learnify.ai-generation.progress.finalizing'](),
  };
  const [displayPercentage, setDisplayPercentage] = useState(0);

  // Smooth percentage animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayPercentage(prev => {
        const diff = progress.percentage - prev;
        if (Math.abs(diff) < 1) {
          return progress.percentage;
        }
        return prev + diff * 0.1;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [progress.percentage]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  const handleRetry = useCallback(() => {
    if (onRetry) {
      onRetry();
    }
  }, [onRetry]);

  if (!open) {
    return null;
  }

  return (
    <Modal
      open={open}
      onOpenChange={() => {
        // Modal cannot be closed by clicking outside during generation
        if (error) {
          handleCancel();
        }
      }}
      width={420}
      contentOptions={{
        style: { padding: 0 },
      }}
      overlayOptions={{
        style: { backgroundColor: 'rgba(0, 0, 0, 0.6)' },
      }}
    >
      <div className={styles.overlayContainer}>
        {error ? (
          // Error state
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>
              <WarningIcon />
            </div>
            <h3 className={styles.errorTitle}>
              {t['com.learnify.ai-generation.error.title']()}
            </h3>
            <p className={styles.errorMessage}>
              {error.message || t['com.learnify.ai-generation.error.message']()}
            </p>
            <div className={styles.errorActions}>
              <button className={styles.cancelButton} onClick={handleCancel}>
                {t.t('com.affine.confirmModal.button.cancel')}
              </button>
              <button className={styles.retryButton} onClick={handleRetry}>
                {t['com.learnify.ai-generation.error.retry']()}
              </button>
            </div>
          </div>
        ) : (
          // Loading state
          <div className={styles.loadingContainer}>
            <div className={styles.loadingIcon}>
              <Loading size={48} />
            </div>
            <h3 className={styles.loadingTitle}>
              {stageMessages[progress.stage] || stageMessages.preparing}
            </h3>
            {progress.message && (
              <p className={styles.loadingMessage}>{progress.message}</p>
            )}

            {/* Show overall progress */}
            {progress.totalItems && progress.totalItems > 1 && (
              <div className={styles.overallProgress}>
                <span className={styles.overallProgressText}>
                  {t.t('com.learnify.ai-generation.progress.total', {
                    current: progress.currentItem || 1,
                    total: progress.totalItems,
                  })}
                </span>
                {progress.currentItemName && (
                  <span className={styles.currentItemName}>
                    {progress.currentItemName}
                  </span>
                )}
              </div>
            )}

            {/* Progress bar */}
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${displayPercentage}%` }}
                />
              </div>
              <span className={styles.progressText}>
                {Math.round(displayPercentage)}%
              </span>
            </div>

            {/* Stage indicators */}
            <div className={styles.stageIndicators}>
              <div
                className={`${styles.stageIndicator} ${
                  progress.stage === 'preparing' ? styles.active : ''
                } ${
                  ['preprocessing', 'generating', 'finalizing'].includes(
                    progress.stage
                  )
                    ? styles.completed
                    : ''
                }`}
              >
                {t['com.learnify.ai-generation.stage.preparing']?.() ||
                  'Preparing'}
              </div>
              <div
                className={`${styles.stageIndicator} ${
                  progress.stage === 'preprocessing' ? styles.active : ''
                } ${
                  ['generating', 'finalizing'].includes(progress.stage)
                    ? styles.completed
                    : ''
                }`}
              >
                {t['com.learnify.ai-generation.stage.preprocessing']?.() ||
                  'Preprocessing'}
              </div>
              <div
                className={`${styles.stageIndicator} ${
                  progress.stage === 'generating' ? styles.active : ''
                } ${progress.stage === 'finalizing' ? styles.completed : ''}`}
              >
                {t['com.learnify.ai-generation.stage.generating']?.() ||
                  'Generating'}
              </div>
              <div
                className={`${styles.stageIndicator} ${
                  progress.stage === 'finalizing' ? styles.active : ''
                }`}
              >
                {t['com.learnify.ai-generation.stage.finalizing']?.() ||
                  'Finalizing'}
              </div>
            </div>

            {onCancel && (
              <button
                className={styles.cancelButtonSmall}
                onClick={handleCancel}
              >
                {t['com.affine.confirmModal.button.cancel']()}
              </button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
