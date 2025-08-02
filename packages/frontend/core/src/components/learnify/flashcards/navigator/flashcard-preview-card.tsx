import type { Collection } from '@affine/core/modules/collection';
import { CollectionRulesService } from '@affine/core/modules/collection-rules';
import { DocsService } from '@affine/core/modules/doc';
import { useI18n } from '@affine/i18n';
import { useService } from '@toeverything/infra';
import { useCallback, useEffect, useMemo, useState } from 'react';

import * as styles from './flashcard-preview-card.css';

interface FlashcardData {
  id: string;
  question: string;
  answer: string;
}

interface QuizCardData {
  id: string;
  question: string;
  options: Array<{
    key: string;
    text: string;
  }>;
  correctAnswer: string;
}

type CardData =
  | { type: 'flashcard'; data: FlashcardData }
  | { type: 'single-choice'; data: QuizCardData }
  | { type: 'unknown'; data: null };

const parseQuizContent = (
  paragraphs: string[],
  docId: string
): QuizCardData | null => {
  console.log('=== FlashcardPreviewCard: Parsing quiz content ===');
  console.log('Document ID:', docId);
  console.log('Paragraphs:', paragraphs);

  let typeIndex = -1;
  let questionIndex = -1;
  let optionsIndex = -1;
  let answerIndex = -1;

  paragraphs.forEach((text, index) => {
    const trimmed = text.trim();
    if (trimmed === '[single-choice]') {
      typeIndex = index;
    } else if (trimmed === '[Question]' || trimmed.startsWith('[Question]')) {
      questionIndex = index;
    } else if (trimmed === '[Options]') {
      optionsIndex = index;
    } else if (trimmed === '[Answer]') {
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

  // Check if the question is on the same line as [Question]
  const questionLine = paragraphs[questionIndex].trim();
  if (questionLine.startsWith('[Question]')) {
    const questionText = questionLine.substring('[Question]'.length).trim();
    if (questionText) {
      questionParts.push(questionText);
    }
  }

  // Get any additional question lines
  for (let i = questionIndex + 1; i < optionsIndex; i++) {
    const text = paragraphs[i].trim();
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

  const endIndex = answerIndex !== -1 ? answerIndex : paragraphs.length;

  for (let i = optionsIndex + 1; i < endIndex; i++) {
    const text = paragraphs[i].trim();
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

  if (answerIndex !== -1 && answerIndex + 1 < paragraphs.length) {
    const answerText = paragraphs[answerIndex + 1].trim();
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

const parseFlashcardContent = (
  paragraphs: string[],
  docId: string
): FlashcardData | null => {
  console.log('=== FlashcardPreviewCard: Parsing flashcard content ===');
  console.log('Document ID:', docId);
  console.log('Total paragraphs:', paragraphs.length);
  console.log('Paragraphs:', paragraphs);

  let typeIndex = -1;
  let questionIndex = -1;
  let answerIndex = -1;

  paragraphs.forEach((text, index) => {
    const trimmed = text.trim();
    console.log(`Paragraph ${index}: "${text}" -> trimmed: "${trimmed}"`);
    if (trimmed === '[flashcard]') {
      typeIndex = index;
      console.log(`Found [flashcard] marker at index ${index}`);
    } else if (trimmed === '[Question]' || trimmed.startsWith('[Question]')) {
      questionIndex = index;
      console.log(`Found [Question] marker at index ${index}`);
    } else if (trimmed === '[Answer]' || trimmed.startsWith('[Answer]')) {
      answerIndex = index;
      console.log(`Found [Answer] marker at index ${index}`);
    }
  });

  console.log('Marker indices:', { typeIndex, questionIndex, answerIndex });

  if (typeIndex === -1 || questionIndex === -1 || answerIndex === -1) {
    console.log('Missing required markers - returning null');
    return null;
  }

  if (!(typeIndex < questionIndex && questionIndex < answerIndex)) {
    console.log('Invalid marker order - returning null');
    return null;
  }

  const questionParts: string[] = [];

  // Check if the question is on the same line as [Question]
  const questionLine = paragraphs[questionIndex].trim();
  if (questionLine.startsWith('[Question]')) {
    const questionText = questionLine.substring('[Question]'.length).trim();
    if (questionText) {
      questionParts.push(questionText);
    }
  }

  // Get any additional question lines
  for (let i = questionIndex + 1; i < answerIndex; i++) {
    const text = paragraphs[i].trim();
    if (text) {
      questionParts.push(text);
    }
  }
  console.log('Question parts:', questionParts);

  if (questionParts.length === 0) {
    console.log('No question content found - returning null');
    return null;
  }

  const answerParts: string[] = [];

  // Check if the answer is on the same line as [Answer]
  const answerLine = paragraphs[answerIndex].trim();
  if (answerLine.startsWith('[Answer]')) {
    const answerText = answerLine.substring('[Answer]'.length).trim();
    if (answerText) {
      answerParts.push(answerText);
    }
  }

  // Get any additional answer lines
  for (let i = answerIndex + 1; i < paragraphs.length; i++) {
    const text = paragraphs[i].trim();
    if (text) {
      answerParts.push(text);
    }
  }
  console.log('Answer parts:', answerParts);

  if (answerParts.length === 0) {
    console.log('No answer content found - returning null');
    return null;
  }

  const question = questionParts.join(' ');
  const answer = answerParts.join(' ');

  console.log('Successfully parsed flashcard:', {
    id: docId,
    question,
    answer,
  });

  return {
    id: docId,
    question,
    answer,
  };
};

const parseCardContent = (paragraphs: string[], docId: string): CardData => {
  if (paragraphs.length === 0) {
    return { type: 'unknown', data: null };
  }

  const firstLine = paragraphs[0].trim();
  console.log('First line of document:', firstLine);

  if (firstLine === '[single-choice]') {
    const quizData = parseQuizContent(paragraphs, docId);
    if (quizData) {
      return { type: 'single-choice', data: quizData };
    }
  } else if (firstLine === '[flashcard]') {
    const flashcardData = parseFlashcardContent(paragraphs, docId);
    if (flashcardData) {
      return { type: 'flashcard', data: flashcardData };
    }
  }

  return { type: 'unknown', data: null };
};

export const FlashcardPreviewCard = ({
  collection,
}: {
  collection: Collection;
}) => {
  const collectionRulesService = useService(CollectionRulesService);
  const [docIds, setDocIds] = useState<string[]>([]);
  const [randomDocId, setRandomDocId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const rules = collection.rules$.value;
    const allowList = collection.allowList$.value;

    const subscription = collectionRulesService
      .watch({
        filters: rules.filters,
        orderBy: { type: 'updated', key: 'updatedDate', desc: true },
        extraAllowList: allowList,
        extraFilters: [
          {
            type: 'system',
            key: 'empty-journal',
            method: 'is',
            value: 'false',
          },
          {
            type: 'system',
            key: 'trash',
            method: 'is',
            value: 'false',
          },
        ],
      })
      .subscribe({
        next: result => {
          console.log('=== FlashcardPreviewCard: Collection watch result ===');
          console.log('Result groups:', result.groups);
          const docs = result.groups.flatMap(group => group.items);
          console.log('Flattened docs:', docs);
          setDocIds(docs);
          if (docs.length > 0) {
            const randomIndex = Math.floor(Math.random() * docs.length);
            const selectedDocId = docs[randomIndex];
            console.log(
              'Selected random doc ID:',
              selectedDocId,
              'from index:',
              randomIndex
            );
            setRandomDocId(selectedDocId);
          } else {
            console.log('No documents found in collection');
          }
          setIsLoading(false);
        },
        error: error => {
          console.error('Failed to load flashcards preview:', error);
          setIsLoading(false);
        },
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [collection, collectionRulesService]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Loading flashcard...</div>
      </div>
    );
  }

  if (!randomDocId || docIds.length === 0) {
    return (
      <div className={styles.emptyPreview}>
        <div className={styles.emptyText}>No flashcards yet</div>
        <div className={styles.emptySubtext}>
          Create your first flashcard to get started
        </div>
      </div>
    );
  }

  return <FlashcardDocumentPreview docId={randomDocId} />;
};

const FlashcardDocumentPreview = ({ docId }: { docId: string }) => {
  const t = useI18n();
  const docsService = useService(DocsService);
  const [showAnswer, setShowAnswer] = useState(false);
  const [cardData, setCardData] = useState<CardData>({
    type: 'unknown',
    data: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const { doc, release } = useMemo(() => {
    console.log('=== FlashcardDocumentPreview: Opening document ===');
    console.log('Opening docId:', docId);
    const result = docsService.open(docId);
    console.log('Opened doc:', result.doc);
    return result;
  }, [docsService, docId]);

  useEffect(() => {
    const loadFlashcard = async () => {
      console.log(
        '=== FlashcardDocumentPreview: Starting to load flashcard ==='
      );
      console.log('Document ID:', docId);

      try {
        console.log('Waiting for doc sync ready...');
        await doc.waitForSyncReady();
        console.log('Doc sync ready completed');

        // Access blockSuiteDoc directly like in mind-map component
        const currentBlockSuiteDoc = doc.blockSuiteDoc;
        console.log('Got blockSuiteDoc from doc:', currentBlockSuiteDoc);

        if (!currentBlockSuiteDoc) {
          console.log('No blockSuiteDoc available');
          setIsLoading(false);
          return;
        }

        console.log('Loading blockSuiteDoc...');
        currentBlockSuiteDoc.load();
        console.log('blockSuiteDoc loaded');

        // Wait a bit for the document to be fully loaded
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log('Checking blockSuiteDoc readiness...');
        console.log('blockSuiteDoc ready:', currentBlockSuiteDoc.ready);
        console.log('blockSuiteDoc root:', currentBlockSuiteDoc.root);

        console.log('Getting paragraph blocks...');
        const paragraphBlocks =
          currentBlockSuiteDoc.getBlocksByFlavour('affine:paragraph');
        console.log('Found paragraph blocks:', paragraphBlocks.length);

        const paragraphs: string[] = [];

        // Check if paragraphBlocks is an array of models instead of blocks
        if (paragraphBlocks.length > 0) {
          console.log('First block sample:', paragraphBlocks[0]);
          console.log('First block keys:', Object.keys(paragraphBlocks[0]));
        }

        paragraphBlocks.forEach((block: any, index: number) => {
          // It seems getBlocksByFlavour returns models directly
          let text = '';
          if (block.text) {
            text = block.text.toString() || '';
          } else if (block.model?.text) {
            text = block.model.text.toString() || '';
          }

          console.log(`Block ${index} text:`, `"${text}"`);
          paragraphs.push(text);
        });

        console.log('All extracted paragraphs:', paragraphs);

        if (paragraphs.length === 0) {
          console.log('No paragraphs found in document');
        }

        if (paragraphs.every(p => !p.trim())) {
          console.log('All paragraphs are empty');
        }

        const parsedCard = parseCardContent(paragraphs, doc.id);
        console.log('Final parsed card result:', parsedCard);
        setCardData(parsedCard);
      } catch (error) {
        console.error('Error loading flashcard:', error);
        console.error('Error stack:', (error as Error).stack);
      } finally {
        setIsLoading(false);
      }
    };

    loadFlashcard().catch(error => {
      console.error('Error in loadFlashcard:', error);
    });
  }, [doc, docId]);

  useEffect(() => {
    return () => {
      release();
    };
  }, [release]);

  const handleShowAnswer = useCallback(() => {
    setShowAnswer(true);
  }, []);

  const handleSelectAnswer = useCallback(
    (optionKey: string) => {
      if (showResult) return;
      setSelectedAnswer(optionKey);
      setShowResult(true);
    },
    [showResult]
  );

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Loading flashcard content...</div>
      </div>
    );
  }

  if (cardData.type === 'unknown' || !cardData.data) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorText}>Unable to load card</div>
        <div
          style={{
            fontSize: '12px',
            color: 'var(--affine-text-secondary)',
            marginTop: '8px',
            padding: '8px',
            backgroundColor: 'var(--affine-background-secondary)',
            borderRadius: '4px',
            fontFamily: 'monospace',
          }}
        >
          Expected formats:
          <br />
          <br />
          Flashcard:
          <br />
          [flashcard]
          <br />
          [Question]
          <br />
          Your question here
          <br />
          [Answer]
          <br />
          Your answer here
          <br />
          <br />
          Single-choice:
          <br />
          [single-choice]
          <br />
          [Question]
          <br />
          Your question here
          <br />
          [Options]
          <br />
          a) Option 1<br />
          b) Option 2<br />
          c) Option 3<br />
          d) Option 4<br />
          [Answer]
          <br />a
        </div>
      </div>
    );
  }

  if (cardData.type === 'flashcard') {
    const flashcard = cardData.data;
    return (
      <div className={styles.flashcardContainer}>
        <div className={styles.flashcardContent}>
          <h3 className={styles.question}>{flashcard.question}</h3>

          {!showAnswer ? (
            <button
              className={styles.showAnswerButton}
              onClick={handleShowAnswer}
            >
              {t['com.learnify.flashcard.show-answer']?.() || 'Show Answer'}
            </button>
          ) : (
            <div className={styles.answerSection}>
              <div className={styles.answerBox}>
                <h4 className={styles.answerLabel}>
                  {t['com.learnify.flashcard.answer']?.() || 'Answer:'}
                </h4>
                <p className={styles.answerText}>{flashcard.answer}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (cardData.type === 'single-choice') {
    const quizCard = cardData.data;
    return (
      <div className={styles.flashcardContainer}>
        <div className={styles.flashcardContent}>
          <h3 className={styles.question}>{quizCard.question}</h3>

          <div className={styles.quizOptions}>
            {quizCard.options.map(option => {
              const isCorrect = option.key === quizCard.correctAnswer;
              const isSelected = option.key === selectedAnswer;
              const showCorrect = showResult && isCorrect;
              const showWrong = showResult && isSelected && !isCorrect;

              return (
                <button
                  key={option.key}
                  className={styles.quizOptionButton}
                  onClick={() => handleSelectAnswer(option.key)}
                  disabled={showResult}
                  data-correct={showCorrect}
                  data-wrong={showWrong}
                  data-selected={isSelected}
                >
                  <span
                    style={{
                      fontWeight: 500,
                      marginRight: '8px',
                      color: 'var(--affine-text-secondary)',
                      fontSize: '14px',
                    }}
                  >
                    {option.key})
                  </span>
                  <span style={{ flex: 1, fontSize: '14px' }}>
                    {option.text}
                  </span>
                  {showCorrect && (
                    <span style={{ marginLeft: '6px', fontSize: '14px' }}>
                      ✓
                    </span>
                  )}
                  {showWrong && (
                    <span style={{ marginLeft: '6px', fontSize: '14px' }}>
                      ✗
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {showResult && (
            <div
              className={styles.quizResultMessage}
              data-correct={selectedAnswer === quizCard.correctAnswer}
              data-incorrect={selectedAnswer !== quizCard.correctAnswer}
            >
              {selectedAnswer === quizCard.correctAnswer
                ? 'Correct!'
                : `Incorrect. The correct answer is ${quizCard.correctAnswer}.`}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};
