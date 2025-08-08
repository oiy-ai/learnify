import { useI18n } from '@affine/i18n';
import { useCallback, useEffect, useState } from 'react';

import * as styles from './detail-card.css';

interface QuizCardData {
  id: string;
  question: string;
  options: Array<{
    key: string;
    text: string;
  }>;
  correctAnswer: string;
}

interface DetailQuizCardProps {
  doc: any;
  pageId?: string;
}

const parseQuizContent = (
  content: string,
  docId: string
): QuizCardData | null => {
  const lines = content.split('\n').map(line => line.trim());

  let typeIndex = -1;
  let questionIndex = -1;
  let optionsIndex = -1;
  let answerIndex = -1;

  lines.forEach((line, index) => {
    if (line === '[single-choice]') {
      typeIndex = index;
    } else if (line === '[Question]') {
      questionIndex = index;
    } else if (line === '[Options]') {
      optionsIndex = index;
    } else if (line === '[Answer]') {
      answerIndex = index;
    }
  });

  console.log('Marker indices:', {
    typeIndex,
    questionIndex,
    optionsIndex,
    answerIndex,
  });

  if (typeIndex === -1 || questionIndex === -1 || optionsIndex === -1) {
    console.log('Missing required markers');
    return null;
  }

  if (!(typeIndex < questionIndex && questionIndex < optionsIndex)) {
    console.log('Invalid marker order');
    return null;
  }

  const questionParts: string[] = [];
  for (let i = questionIndex + 1; i < optionsIndex; i++) {
    const text = lines[i];
    if (text) {
      questionParts.push(text);
    }
  }

  if (questionParts.length === 0) {
    console.log('No question content found');
    return null;
  }

  const question = questionParts.join(' ');
  console.log('Parsed question:', question);

  const options: Array<{ key: string; text: string }> = [];
  const optionRegex = /^([a-d])\)\s*(.+)/;

  const endIndex = answerIndex !== -1 ? answerIndex : lines.length;

  for (let i = optionsIndex + 1; i < endIndex; i++) {
    const text = lines[i];
    if (text) {
      const match = text.match(optionRegex);
      if (match) {
        const [, key, optionText] = match;
        options.push({ key, text: optionText.trim() });
      }
    }
  }

  console.log('Parsed options:', options);

  if (options.length < 2) {
    console.log('Not enough options found:', options.length);
    return null;
  }

  let correctAnswer = '';

  if (answerIndex !== -1 && answerIndex + 1 < lines.length) {
    const answerText = lines[answerIndex + 1];
    if (answerText && /^[a-d]$/.test(answerText)) {
      correctAnswer = answerText;
      console.log('Found answer from [Answer] section:', correctAnswer);
    }
  }

  if (!correctAnswer) {
    console.log('No answer found in [Answer] section');
    return null;
  }

  console.log('Parsed quiz card:', { question, options, correctAnswer });

  return {
    id: docId,
    question,
    options,
    correctAnswer,
  };
};

export const DetailQuizCard = ({ doc, pageId }: DetailQuizCardProps) => {
  const t = useI18n();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [currentCard, setCurrentCard] = useState<QuizCardData | null>(null);
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

        // Get all paragraph content and join
        const content = paragraphBlocks
          .map((block: any) => block.model.text?.toString() || '')
          .join('\n')
          .trim();

        if (!content) {
          setError(
            t['com.learnify.flashcard.error.no-content']?.() ||
              'No content found in this card'
          );
          return;
        }

        const parsedCard = parseQuizContent(content, doc.id);
        if (parsedCard) {
          setCurrentCard(parsedCard);
          setError(null);
        } else {
          setError(
            t['com.learnify.flashcard.error.format-mismatch']?.() ||
              'Card content format is incorrect. Expected single-choice format.'
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
    setSelectedAnswer(null);
    setShowResult(false);
  }, [pageId]);

  const handleSelectAnswer = useCallback(
    (optionKey: string) => {
      if (showResult) return;

      setSelectedAnswer(optionKey);
      setShowResult(true);
    },
    [showResult]
  );

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>�</div>
        <h2 className={styles.errorTitle}>
          {t['com.learnify.flashcard.error.title']?.() || 'Unable to Load Card'}
        </h2>
        <p className={styles.errorMessage}>{error}</p>
      </div>
    );
  }

  if (!currentCard) {
    return null;
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.question}>{currentCard.question}</h2>

      <div className={styles.options}>
        {currentCard.options.map(option => {
          const isCorrect = option.key === currentCard.correctAnswer;
          const isSelected = option.key === selectedAnswer;
          const showCorrect = showResult && isCorrect;
          const showWrong = showResult && isSelected && !isCorrect;

          return (
            <button
              key={option.key}
              className={styles.optionButton}
              onClick={() => handleSelectAnswer(option.key)}
              disabled={showResult}
              data-correct={showCorrect}
              data-wrong={showWrong}
              data-selected={isSelected}
            >
              <span className={styles.optionKey}>{option.key})</span>
              <span className={styles.optionText}>{option.text}</span>
              {showCorrect && <span className={styles.resultIcon}></span>}
              {showWrong && <span className={styles.resultIcon}></span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
