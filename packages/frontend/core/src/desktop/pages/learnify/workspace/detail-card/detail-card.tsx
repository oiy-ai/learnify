 
import { Button } from '@affine/component';
import { PageDetailLoading } from '@affine/component/page-detail-skeleton';
import { useGuard } from '@affine/core/components/guard';
import { DocService } from '@affine/core/modules/doc';
import { useI18n } from '@affine/i18n';
import { ArrowLeftSmallIcon, ArrowRightSmallIcon } from '@blocksuite/icons/rc';
import { useServices } from '@toeverything/infra';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PageNotFound } from '../../../404';
import { DetailPageWrapper } from '../../../workspace/detail-page/detail-page-wrapper';
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
const parseCardContent = (
  paragraphs: string[],
  docId: string
): FlashcardData | null => {
  console.log('Parsing card content, paragraphs:', paragraphs);

  // 查找 single-choice 标记
  const singleChoiceIndex = paragraphs.findIndex(
    p => p.trim() === 'single-choice'
  );
  if (singleChoiceIndex === -1) {
    console.log('No single-choice marker found');
    return null;
  }

  // 题目应该在 single-choice 之后的第一个非空段落
  let question = '';
  let questionIndex = -1;

  for (let i = singleChoiceIndex + 1; i < paragraphs.length; i++) {
    const text = paragraphs[i].trim();
    if (text && !text.match(/^[a-f]\)/)) {
      question = text;
      questionIndex = i;
      break;
    }
  }

  if (!question) {
    console.log('No question found');
    return null;
  }

  // 解析选项 - 从问题之后开始查找
  const options: Array<{ key: string; text: string }> = [];

  for (let i = questionIndex + 1; i < paragraphs.length; i++) {
    const text = paragraphs[i].trim();
    const match = text.match(/^([a-f])\)\s*(.+)/);
    if (match) {
      const [, key, optionText] = match;
      options.push({ key, text: optionText.trim() });
    }
  }

  if (options.length < 2) {
    console.log('Not enough options found:', options);
    return null;
  }

  // TODO: 从文档元数据中获取正确答案
  // 暂时使用第一个选项作为正确答案
  const correctAnswer = options[0].key;

  console.log('Parsed card:', { question, options, correctAnswer });

  return {
    id: docId,
    question,
    options,
    correctAnswer,
  };
};

const DetailCardPageImpl = () => {
  const t = useI18n();
  const navigate = useNavigate();
  const { pageId, workspaceId } = useParams();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [currentCard, setCurrentCard] = useState<FlashcardData | null>(null);

  // 获取文档服务
  const { docService } = useServices({ DocService });
  const doc = docService.doc;

  // 当前卡片索引
  const currentCardIndex = useMemo(() => {
    return mockFlashcards.findIndex(card => card.id === pageId) || 0;
  }, [pageId]);

  // 从文档中解析卡片数据
  useEffect(() => {
    if (!doc || !doc.blockSuiteDoc) {
      setCurrentCard(mockFlashcards[currentCardIndex] || mockFlashcards[0]);
      return;
    }

    try {
      // 获取所有段落块的文本内容
      const paragraphBlocks =
        doc.blockSuiteDoc.getBlocksByFlavour('affine:paragraph');
      const paragraphs: string[] = [];

      paragraphBlocks.forEach(block => {
        const text = block.model.text?.toString() || '';
        paragraphs.push(text);
      });

      console.log('Found paragraphs:', paragraphs);

      // 解析内容
      const parsedCard = parseCardContent(paragraphs, doc.id);
      if (parsedCard) {
        setCurrentCard(parsedCard);
      } else {
        // 如果解析失败，使用 mock 数据
        setCurrentCard(mockFlashcards[currentCardIndex] || mockFlashcards[0]);
      }
    } catch (error) {
      console.error('Error parsing card content:', error);
      setCurrentCard(mockFlashcards[currentCardIndex] || mockFlashcards[0]);
    }
  }, [doc, currentCardIndex]);

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
