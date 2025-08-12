import { DocsSearchService } from '@affine/core/modules/docs-search';
import { WorkspaceService } from '@affine/core/modules/workspace';
import { useI18n } from '@affine/i18n';
import { LiveData, useLiveData, useService } from '@toeverything/infra';
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import * as styles from './group-definitions.css';

interface PagePreviewProps {
  pageId: string;
  emptyFallback?: ReactNode;
  fallback?: ReactNode;
  rawType?: 'flashcards' | 'mind-maps';
}

interface QuizCardPreviewProps {
  question: string;
  options: Array<{ label: string; text: string }>;
  correctAnswer?: string;
}

interface FlashcardPreviewProps {
  question: string;
  answer: string;
}

const QuizCardPreview = ({
  question,
  options,
  correctAnswer,
}: QuizCardPreviewProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelectAnswer = useCallback(
    (optionLabel: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (showResult) return;

      setSelectedAnswer(optionLabel);
      setShowResult(true);
    },
    [showResult]
  );

  return (
    <div className={styles.flashcardContainer}>
      <div className={styles.flashcardQuestion}>{question}</div>
      <div className={styles.flashcardOptionsContainer}>
        {options.map((option, index) => {
          const isCorrect = correctAnswer && option.label === correctAnswer;
          const isSelected = option.label === selectedAnswer;
          const showCorrect = showResult && isCorrect;
          const showWrong = showResult && isSelected && !isCorrect;

          return (
            <button
              key={index}
              className={styles.flashcardOption}
              onClick={e => handleSelectAnswer(option.label, e)}
              disabled={showResult}
              data-correct={showCorrect}
              data-wrong={showWrong}
              data-selected={isSelected}
            >
              {option.label.toUpperCase()}) {option.text}
              {showCorrect && <span className={styles.resultIcon}>✓</span>}
              {showWrong && <span className={styles.resultIcon}>✗</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const FlashcardPreview = ({ question, answer }: FlashcardPreviewProps) => {
  const t = useI18n();
  const [showAnswer, setShowAnswer] = useState(false);

  const handleToggleAnswer = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAnswer(prev => !prev);
  }, []);

  return (
    <div className={styles.flashcardContainer}>
      <div className={styles.flashcardQuestion}>{question}</div>
      <div className={styles.flashcardOptionsContainer}>
        <button
          className={styles.flashcardOption}
          onClick={handleToggleAnswer}
          data-selected={showAnswer}
        >
          {showAnswer
            ? `${t['com.learnify.flashcard.answer']?.() || 'Answer'}: ${answer}`
            : t['com.learnify.flashcard.view-answer']?.() || 'View Answer'}
        </button>
      </div>
    </div>
  );
};

const PagePreviewInner = ({
  pageId,
  emptyFallback,
  fallback,
  rawType,
}: PagePreviewProps) => {
  const docSummary = useService(DocsSearchService);
  const workspaceService = useService(WorkspaceService);
  const summary = useLiveData(
    useMemo(
      () => LiveData.from(docSummary.watchDocSummary(pageId), null),
      [docSummary, pageId]
    )
  );

  useEffect(() => {
    const undo = docSummary.indexer.addPriority(pageId, 100);
    return undo;
  }, [docSummary, pageId]);

  useEffect(() => {
    const undo = workspaceService.workspace.engine.doc.addPriority(pageId, 10);
    return undo;
  }, [workspaceService, pageId]);

  const res =
    summary === null ? fallback : summary === '' ? emptyFallback : summary;

  if (rawType === 'flashcards') {
    return postprocessFlashcardContent(res);
  }

  // if (rawType === 'mind-maps') {
  // TODO: don't implement for now
  // }

  return res;
};

export const PagePreview = (props: PagePreviewProps) => {
  return <PagePreviewInner {...props} />;
};

function postprocessFlashcardContent(content: ReactNode): ReactNode {
  // If not string, return original content directly
  if (typeof content !== 'string') {
    return content;
  }

  let postprocessor: ReactNode = content;

  // Helper function: limit text length to specified word count
  const limitTextToWords = (text: string, maxWords: number): string => {
    const words = text.split(/\s+/);
    if (words.length <= maxWords) {
      return text;
    }
    return words.slice(0, maxWords).join(' ') + '...';
  };

  // Process simple flashcard format: [flashcard][Question]Q[Answer]A
  if (content.startsWith('[flashcard]')) {
    const afterType = content.replace('[flashcard]', '').trim();

    // Extract question
    const questionMatch = afterType.match(/\[Question\](.*?)(?=\[Answer\])/s);
    const rawQuestion = questionMatch ? questionMatch[1].trim() : '';

    // Extract answer
    const answerMatch = afterType.match(/\[Answer\](.*?)$/s);
    const answer = answerMatch ? answerMatch[1].trim() : '';

    // Limit question length to 45 words
    const question = limitTextToWords(rawQuestion, 45);

    if (question && answer) {
      postprocessor = <FlashcardPreview question={question} answer={answer} />;
    } else {
      postprocessor = content; // If parsing fails, fallback to original content
    }
  } else if (content.startsWith('[single-choice]')) {
    // Format: [single-choice] [Question]Find the equation... [Options]a) Option A b) Option B [Answer]d
    const afterType = content.replace('[single-choice]', '').trim();

    // Extract question between [Question] and [Options]
    const questionMatch = afterType.match(/\[Question\](.*?)(?=\[Options\])/s);
    const rawQuestion = questionMatch ? questionMatch[1].trim() : '';

    // Extract options section
    const optionsMatch = afterType.match(/\[Options\](.*?)(?=\[Answer\]|$)/s);
    const optionsStr = optionsMatch ? optionsMatch[1].trim() : '';

    // Extract answer after [Answer]
    const answerMatch = afterType.match(/\[Answer\]\s*([a-d])/);
    const correctAnswer = answerMatch ? answerMatch[1] : undefined;

    // Limit question length to 45 words
    const question = limitTextToWords(rawQuestion, 45);

    // Extract individual options by finding all option patterns
    const optionMatches = [...optionsStr.matchAll(/([a-d])\)\s*/g)];
    const options: Array<{ label: string; text: string }> = [];

    for (let i = 0; i < optionMatches.length; i++) {
      const currentMatch = optionMatches[i];
      const nextMatch = optionMatches[i + 1];

      const startIndex = currentMatch.index! + currentMatch[0].length;
      const endIndex = nextMatch ? nextMatch.index! : optionsStr.length;

      const optionText = optionsStr.slice(startIndex, endIndex).trim();

      options.push({
        label: currentMatch[1],
        text: optionText,
      });
    }

    // Return flashcard component with question and option buttons
    if (question && options.length > 0) {
      postprocessor = (
        <QuizCardPreview
          question={question}
          options={options}
          correctAnswer={correctAnswer}
        />
      );
    } else {
      postprocessor = content; // fallback to original content if parsing fails
    }
  }

  if (content.startsWith('[multiple-choice]')) {
    postprocessor = 'BBB';
  }

  if (content.startsWith('[fill-in-the-blank]')) {
    postprocessor = 'CCC';
  }

  return postprocessor;
}
