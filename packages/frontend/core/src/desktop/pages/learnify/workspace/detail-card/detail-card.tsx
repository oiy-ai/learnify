import { PageDetailLoading } from '@affine/component/page-detail-skeleton';
import { useGuard } from '@affine/core/components/guard';
import { DocService } from '@affine/core/modules/doc';
import { useI18n } from '@affine/i18n';
import { useServices } from '@toeverything/infra';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { PageNotFound } from '../../../404';
import { DetailPageWrapper } from '../../../workspace/detail-page/detail-page-wrapper';
import * as styles from './detail-card.css';
import { DetailFlashcard } from './detail-flashcard';
import { DetailQuizCard } from './detail-quiz-card';

type CardType = 'quiz' | 'flashcard' | 'unknown';

const detectCardType = (paragraphs: string[]): CardType => {
  if (paragraphs.length === 0) return 'unknown';

  const firstLine = paragraphs[0].trim();

  console.log('firstLine', firstLine);

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

  const { docService } = useServices({ DocService });
  const doc = docService.doc;

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

        const docId = doc.blockSuiteDoc.id;
        console.log('docId', docId);
        const blocks = doc.blockSuiteDoc.getAllModels();
        console.log('blocks', blocks);

        const paragraphBlocks =
          doc.blockSuiteDoc.getBlocksByFlavour('affine:paragraph');
        const paragraphs: string[] = [];

        paragraphBlocks.forEach((block: any) => {
          const text = block.model.text?.toString() || '';
          paragraphs.push(text);
        });

        console.log('paragraphBlocks', paragraphBlocks);
        console.log('paragraphs', paragraphs);

        const detectedType = detectCardType(paragraphs);
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
