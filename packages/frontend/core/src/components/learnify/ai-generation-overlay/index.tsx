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

const stageMessages = {
  preparing: '准备材料中...',
  preprocessing: 'AI 正在分析材料...',
  generating: '正在生成内容...',
  finalizing: '完成最后步骤...',
};

export const AIGenerationOverlay = ({
  open,
  progress = { stage: 'preparing', percentage: 0, message: '' },
  error,
  onCancel,
  onRetry,
}: AIGenerationOverlayProps) => {
  const t = useI18n();
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
            <h3 className={styles.errorTitle}>生成失败</h3>
            <p className={styles.errorMessage}>
              {error.message || '生成内容时出现错误，请重试'}
            </p>
            <div className={styles.errorActions}>
              <button className={styles.cancelButton} onClick={handleCancel}>
                {t.t('com.affine.confirmModal.button.cancel')}
              </button>
              <button className={styles.retryButton} onClick={handleRetry}>
                重试
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
              {stageMessages[progress.stage] || '处理中...'}
            </h3>
            {progress.message && (
              <p className={styles.loadingMessage}>{progress.message}</p>
            )}

            {/* Show overall progress */}
            {progress.totalItems && progress.totalItems > 1 && (
              <div className={styles.overallProgress}>
                <span className={styles.overallProgressText}>
                  总进度: {progress.currentItem || 1} / {progress.totalItems}
                </span>
                {progress.currentItemName && (
                  <span className={styles.currentItemName}>
                    正在处理: {progress.currentItemName}
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
                  ['generating', 'processing', 'finalizing'].includes(
                    progress.stage
                  )
                    ? styles.completed
                    : ''
                }`}
              >
                准备
              </div>
              <div
                className={`${styles.stageIndicator} ${
                  progress.stage === 'generating' ? styles.active : ''
                } ${
                  ['processing', 'finalizing'].includes(progress.stage)
                    ? styles.completed
                    : ''
                }`}
              >
                生成
              </div>
              <div
                className={`${styles.stageIndicator} ${
                  progress.stage === 'generating' ? styles.active : ''
                } ${progress.stage === 'finalizing' ? styles.completed : ''}`}
              >
                处理
              </div>
              <div
                className={`${styles.stageIndicator} ${
                  progress.stage === 'finalizing' ? styles.active : ''
                }`}
              >
                完成
              </div>
            </div>

            {onCancel && (
              <button
                className={styles.cancelButtonSmall}
                onClick={handleCancel}
              >
                取消
              </button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
