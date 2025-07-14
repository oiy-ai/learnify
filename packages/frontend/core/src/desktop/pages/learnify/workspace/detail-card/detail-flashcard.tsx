import { useI18n } from '@affine/i18n';
import { useEffect, useState } from 'react';

import * as styles from './detail-card.css';

interface FlashcardData {
  id: string;
  question: string;
  answer: string;
}

interface DetailFlashcardProps {
  doc: any;
  pageId?: string;
}

const parseFlashcardContent = (
  paragraphs: string[],
  docId: string
): FlashcardData | null => {
  console.log('Parsing flashcard content, paragraphs:', paragraphs);

  let typeIndex = -1;
  let questionIndex = -1;
  let answerIndex = -1;

  paragraphs.forEach((text, index) => {
    const trimmed = text.trim();
    if (trimmed === '[flashcard]') {
      typeIndex = index;
    } else if (trimmed === '[Question]') {
      questionIndex = index;
    } else if (trimmed === '[Answer]') {
      answerIndex = index;
    }
  });

  console.log('Marker indices:', { typeIndex, questionIndex, answerIndex });

  if (typeIndex === -1 || questionIndex === -1 || answerIndex === -1) {
    console.log('Missing required markers');
    return null;
  }

  if (!(typeIndex < questionIndex && questionIndex < answerIndex)) {
    console.log('Invalid marker order');
    return null;
  }

  const questionParts: string[] = [];
  for (let i = questionIndex + 1; i < answerIndex; i++) {
    const text = paragraphs[i].trim();
    if (text) {
      questionParts.push(text);
    }
  }

  if (questionParts.length === 0) {
    console.log('No question content found');
    return null;
  }

  const answerParts: string[] = [];
  for (let i = answerIndex + 1; i < paragraphs.length; i++) {
    const text = paragraphs[i].trim();
    if (text) {
      answerParts.push(text);
    }
  }

  if (answerParts.length === 0) {
    console.log('No answer content found');
    return null;
  }

  const question = questionParts.join(' ');
  const answer = answerParts.join(' ');

  console.log('Parsed flashcard:', { question, answer });

  return {
    id: docId,
    question,
    answer,
  };
};

export const DetailFlashcard = ({ doc, pageId }: DetailFlashcardProps) => {
  const t = useI18n();
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentCard, setCurrentCard] = useState<FlashcardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCard = async () => {
      if (!doc || !doc.blockSuiteDoc) {
        setError(
          t['com.learnify.flashcard.error.fetch-failed']?.() ||
            'Failed to load card content from server'
        );
        return;
      }

      try {
        // 等待文档同步完成
        await doc.waitForSyncReady();

        const paragraphBlocks =
          doc.blockSuiteDoc.getBlocksByFlavour('affine:paragraph');
        const paragraphs: string[] = [];

        paragraphBlocks.forEach((block: any) => {
          const text = block.model.text?.toString() || '';
          paragraphs.push(text);
        });

        console.log('Found paragraphs:', paragraphs);

        if (paragraphs.every(p => !p.trim())) {
          setError(
            t['com.learnify.flashcard.error.no-content']?.() ||
              'No content found in this card'
          );
          return;
        }

        const parsedCard = parseFlashcardContent(paragraphs, doc.id);
        if (parsedCard) {
          setCurrentCard(parsedCard);
          setError(null);
        } else {
          setError(
            t['com.learnify.flashcard.error.format-mismatch']?.() ||
              'Card content format is incorrect. Expected flashcard format.'
          );
        }
      } catch (error) {
        console.error('Error parsing card content:', error);
        setError(
          t['com.learnify.flashcard.error.parse-failed']?.() ||
            'Failed to parse card content'
        );
      }
    };

    loadCard().catch(error => {
      console.error('Error in loadCard:', error);
    });
  }, [doc, t]);

  useEffect(() => {
    setShowAnswer(false);
  }, [pageId]);

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>�</div>
        <h2 className={styles.errorTitle}>
          {t['com.learnify.flashcard.error.title']?.() || 'Unable to Load Card'}
        </h2>
        <p className={styles.errorMessage}>{error}</p>
        {error.includes('format') && (
          <div className={styles.errorHint}>
            <p>
              {t['com.learnify.flashcard.error.format-hint']?.() ||
                'Expected format:'}
            </p>
            <pre className={styles.formatExample}>
              flashcard [Question] Your question content here... [Answer] Your
              answer content here...
            </pre>
          </div>
        )}
      </div>
    );
  }

  if (!currentCard) {
    return null;
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.question}>{currentCard.question}</h2>

      {!showAnswer ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '32px',
          }}
        >
          <button
            className={styles.optionButton}
            onClick={() => setShowAnswer(true)}
            style={{ maxWidth: '200px' }}
          >
            <span className={styles.optionText}>
              {t['com.learnify.flashcard.show-answer']?.() || 'Show Answer'}
            </span>
          </button>
        </div>
      ) : (
        <div style={{ marginTop: '32px' }}>
          <div
            style={{
              backgroundColor: 'var(--affine-background-secondary)',
              borderRadius: '8px',
              padding: '24px',
              border: '1px solid var(--affine-border-color)',
            }}
          >
            <h3
              style={{
                fontSize: '18px',
                fontWeight: 600,
                marginBottom: '16px',
                color: 'var(--affine-text-primary)',
              }}
            >
              {t['com.learnify.flashcard.answer']?.() || 'Answer:'}
            </h3>
            <p
              style={{
                fontSize: '16px',
                lineHeight: '1.6',
                color: 'var(--affine-text-primary)',
              }}
            >
              {currentCard.answer}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '24px',
            }}
          >
            <button
              className={styles.optionButton}
              onClick={() => setShowAnswer(false)}
              style={{ maxWidth: '200px' }}
            >
              <span className={styles.optionText}>
                {t['com.learnify.flashcard.hide-answer']?.() || 'Hide Answer'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
