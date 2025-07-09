/* eslint-disable no-unused-vars */
import { Button } from '@affine/component';
import { useI18n } from '@affine/i18n';
import { ArrowLeftSmallIcon, ArrowRightSmallIcon } from '@blocksuite/icons/rc';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import * as styles from './detail-card.css';

interface FlashcardData {
  id: string;
  question: string;
  options: Array<{
    key: string;
    text: string;
  }>;
  correctAnswer: string;
}

// Mock data - 模拟卡片数据
const mockFlashcards: FlashcardData[] = [
  {
    id: 'card1',
    question: 'What is the capital of France?',
    options: [
      { key: 'a', text: 'London' },
      { key: 'b', text: 'Paris' },
      { key: 'c', text: 'Berlin' },
      { key: 'd', text: 'Madrid' },
    ],
    correctAnswer: 'b',
  },
  {
    id: 'card2',
    question:
      'Which programming language is known for its use in web development and has a logo featuring a coffee cup?',
    options: [
      { key: 'a', text: 'Python' },
      { key: 'b', text: 'C++' },
      { key: 'c', text: 'Java' },
      { key: 'd', text: 'Ruby' },
      { key: 'e', text: 'JavaScript' },
    ],
    correctAnswer: 'c',
  },
  {
    id: 'card3',
    question: 'What is the largest planet in our solar system?',
    options: [
      { key: 'a', text: 'Earth' },
      { key: 'b', text: 'Mars' },
      { key: 'c', text: 'Jupiter' },
      { key: 'd', text: 'Saturn' },
    ],
    correctAnswer: 'c',
  },
];

// 解析文档内容为卡片数据
// @ts-ignore
const parseCardContent = (content: string): FlashcardData | null => {
  if (!content || !content.includes('single-choice')) {
    return null;
  }

  const lines = content.split('\n').filter(line => line.trim());
  const questionStartIndex =
    lines.findIndex(line => line.includes('single-choice')) + 1;

  if (questionStartIndex === 0 || questionStartIndex >= lines.length) {
    return null;
  }

  // 找到问题文本
  let question = '';
  let optionStartIndex = questionStartIndex;

  for (let i = questionStartIndex; i < lines.length; i++) {
    if (/^[a-f]\)/.test(lines[i].trim())) {
      optionStartIndex = i;
      break;
    }
    question += lines[i] + ' ';
  }

  question = question.trim();

  // 解析选项
  const options: Array<{ key: string; text: string }> = [];
  let correctAnswer = '';

  for (let i = optionStartIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    const match = line.match(/^([a-f])\)\s*(.+)/);
    if (match) {
      const [, key, text] = match;
      options.push({ key, text: text.trim() });
      // 这里暂时将第一个选项设为正确答案，实际应该从文档元数据中获取
      if (options.length === 1) {
        correctAnswer = key;
      }
    }
  }

  if (options.length < 2) {
    return null;
  }

  return {
    id: 'temp-id',
    question,
    options,
    correctAnswer,
  };
};

const DetailCardPage = () => {
  const t = useI18n();
  const navigate = useNavigate();
  const { pageId, workspaceId } = useParams();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  // 当前卡片索引
  const currentCardIndex = useMemo(() => {
    return mockFlashcards.findIndex(card => card.id === pageId) || 0;
  }, [pageId]);

  // 当前卡片数据
  const currentCard = useMemo(() => {
    // 实际应该从文档服务获取内容并解析
    // const doc = useService(DocsService).list.doc$(pageId);
    // const content = doc?.content;
    // return parseCardContent(content);

    // 现在使用 mock 数据
    return mockFlashcards[currentCardIndex] || mockFlashcards[0];
  }, [currentCardIndex]);

  // 重置答题状态
  useEffect(() => {
    setSelectedAnswer(null);
    setShowResult(false);
  }, [pageId]);

  // 处理答案选择
  const handleSelectAnswer = useCallback(
    (optionKey: string) => {
      if (showResult) return;

      setSelectedAnswer(optionKey);
      setShowResult(true);
    },
    [showResult]
  );

  // 导航到上一张卡片
  const handlePrevious = useCallback(() => {
    if (currentCardIndex > 0) {
      const prevCard = mockFlashcards[currentCardIndex - 1];
      navigate(`/workspace/${workspaceId}/flashcard/${prevCard.id}`);
    }
  }, [currentCardIndex, navigate, workspaceId]);

  // 导航到下一张卡片
  const handleNext = useCallback(() => {
    if (currentCardIndex < mockFlashcards.length - 1) {
      const nextCard = mockFlashcards[currentCardIndex + 1];
      navigate(`/workspace/${workspaceId}/flashcard/${nextCard.id}`);
    }
  }, [currentCardIndex, navigate, workspaceId]);

  // 返回列表
  const handleBackToList = useCallback(() => {
    navigate(`/workspace/${workspaceId}/flashcards`);
  }, [navigate, workspaceId]);

  if (!currentCard) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Button variant="plain" onClick={handleBackToList}>
          <ArrowLeftSmallIcon />
          <span>{t['com.affine.back']?.() || 'Back'}</span>
        </Button>
        <span className={styles.cardCounter}>
          {currentCardIndex + 1} / {mockFlashcards.length}
        </span>
      </header>

      <div className={styles.cardContainer}>
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
                  {showCorrect && <span className={styles.resultIcon}>✓</span>}
                  {showWrong && <span className={styles.resultIcon}>✗</span>}
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className={styles.resultMessage}>
              {selectedAnswer === currentCard.correctAnswer
                ? t['com.affine.flashcard.correct']?.() || 'Correct!'
                : t['com.affine.flashcard.incorrect']?.() ||
                  'Incorrect. Try again!'}
            </div>
          )}
        </div>

        <div className={styles.navigation}>
          <Button
            variant="plain"
            onClick={handlePrevious}
            disabled={currentCardIndex === 0}
          >
            <ArrowLeftSmallIcon />
            {t['com.affine.previous']?.() || 'Previous'}
          </Button>

          <Button
            variant="primary"
            onClick={handleNext}
            disabled={currentCardIndex === mockFlashcards.length - 1}
          >
            {t['com.affine.next']?.() || 'Next'}
            <ArrowRightSmallIcon />
          </Button>
        </div>
      </div>
    </div>
  );
};

export { DetailCardPage as Component };
