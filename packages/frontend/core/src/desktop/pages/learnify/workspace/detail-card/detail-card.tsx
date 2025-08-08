import { PageDetailLoading } from '@affine/component/page-detail-skeleton';
import { useGuard } from '@affine/core/components/guard';
import { DocService } from '@affine/core/modules/doc';
import { useI18n } from '@affine/i18n';
import { useServices } from '@toeverything/infra';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { PageNotFound } from '../../../404';
import { DetailPageWrapper } from '../../../workspace/detail-page/detail-page-wrapper';
import * as styles from './detail-card.css';
import { DetailFlashcard } from './detail-flashcard';
import { DetailQuizCard } from './detail-quiz-card';

type CardType = 'quiz' | 'flashcard' | 'unknown';

const detectCardType = (content: string): CardType => {
  if (!content) return 'unknown';

  const firstLine = content.split('\n')[0].trim();

  if (firstLine === '[single-choice]') {
    return 'quiz';
  } else if (firstLine === '[flashcard]') {
    return 'flashcard';
  }

  return 'unknown';
};

const DetailCardPageImpl = () => {
  const t = useI18n();
  const { pageId } = useParams();
  const [cardType, setCardType] = useState<CardType>('unknown');
  const [isLoading, setIsLoading] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const totalCards = 10; // Mock data for now

  const { docService } = useServices({ DocService });
  const doc = docService.doc;

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && currentCardIndex > 0) {
        setCurrentCardIndex(prev => prev - 1);
      } else if (
        event.key === 'ArrowRight' &&
        currentCardIndex < totalCards - 1
      ) {
        setCurrentCardIndex(prev => prev + 1);
      }
    },
    [currentCardIndex, totalCards]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    const detectType = async () => {
      setIsLoading(true);

      if (!doc || !doc.blockSuiteDoc) {
        setIsLoading(false);
        return;
      }

      try {
        // 等待文档同步完成
        await doc.waitForSyncReady();

        const paragraphBlocks =
          doc.blockSuiteDoc.getBlocksByFlavour('affine:paragraph');

        // Get all paragraph content and join
        const content = paragraphBlocks
          .map((block: any) => block.model.text?.toString() || '')
          .join('\n')
          .trim();

        const detectedType = detectCardType(content);
        setCardType(detectedType);
      } catch (error) {
        console.error('Error detecting card type:', error);
        setCardType('unknown');
      } finally {
        setIsLoading(false);
      }
    };

    detectType().catch(error => {
      console.error('Error in detectType:', error);
    });
  }, [doc]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <PageDetailLoading />
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2 className={styles.errorTitle}>
            {t['com.affine.flashcard.error.title']?.() || 'Unable to Load Card'}
          </h2>
          <p className={styles.errorMessage}>
            {t['com.affine.flashcard.error.fetch-failed']?.() ||
              'Failed to load card content from server'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.navigationHeader}>
        <button
          className={styles.navButton}
          onClick={() => setCurrentCardIndex(prev => Math.max(0, prev - 1))}
          disabled={currentCardIndex === 0}
          aria-label="Previous card"
          title="Previous card (←)"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.5 15L7.5 10L12.5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Previous</span>
        </button>

        <span className={styles.cardCounter}>
          Card {currentCardIndex + 1} of {totalCards}
        </span>

        <button
          className={styles.navButton}
          onClick={() =>
            setCurrentCardIndex(prev => Math.min(totalCards - 1, prev + 1))
          }
          disabled={currentCardIndex === totalCards - 1}
          aria-label="Next card"
          title="Next card (→)"
        >
          <span>Next</span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.5 15L12.5 10L7.5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className={styles.cardContainer}>
        {cardType === 'quiz' && <DetailQuizCard doc={doc} pageId={pageId} />}
        {cardType === 'flashcard' && (
          <DetailFlashcard doc={doc} pageId={pageId} />
        )}
        {cardType === 'unknown' && (
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>⚠️</div>
            <h2 className={styles.errorTitle}>
              {t['com.affine.flashcard.error.title']?.() ||
                'Unable to Load Card'}
            </h2>
            <p className={styles.errorMessage}>
              {t['com.affine.flashcard.error.format-mismatch']?.() ||
                'Unknown card format. Expected [single-choice] or flashcard.'}
            </p>
            <div className={styles.errorHint}>
              <p>
                {t['com.affine.flashcard.error.format-hint']?.() ||
                  'Expected formats:'}
              </p>
              <pre className={styles.formatExample}>
                Card Type Not Supported
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DetailCardPage = () => {
  const params = useParams();
  const pageId = params.pageId;
  const canAccess = useGuard('Doc_Read', pageId ?? '');

  return pageId ? (
    <DetailPageWrapper
      pageId={pageId}
      canAccess={canAccess}
      skeleton={<PageDetailLoading />}
      notFound={<PageNotFound noPermission />}
    >
      <DetailCardPageImpl />
    </DetailPageWrapper>
  ) : null;
};

export { DetailCardPage as Component };
