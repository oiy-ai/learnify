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

interface FlashcardData {
  id: string;
  question: string;
  options: Array<{
    key: string;
    text: string;
  }>;
  correctAnswer: string;
}

// 解析文档内容为卡片数据
const parseCardContent = (
  paragraphs: string[],
  docId: string
): FlashcardData | null => {
  console.log('Parsing card content, paragraphs:', paragraphs);

  // 查找标记位置
  let typeIndex = -1;
  let questionIndex = -1;
  let optionsIndex = -1;

  paragraphs.forEach((text, index) => {
    const trimmed = text.trim();
    if (trimmed === '[single-choice]') {
      typeIndex = index;
    } else if (trimmed === '[Question]') {
      questionIndex = index;
    } else if (trimmed === '[Options]') {
      optionsIndex = index;
    }
  });

  console.log('Marker indices:', { typeIndex, questionIndex, optionsIndex });

  // 验证标记是否存在且顺序正确
  if (typeIndex === -1 || questionIndex === -1 || optionsIndex === -1) {
    console.log('Missing required markers');
    return null;
  }

  if (!(typeIndex < questionIndex && questionIndex < optionsIndex)) {
    console.log('Invalid marker order');
    return null;
  }

  // 提取问题内容（从 [Question] 后到 [Options] 前的所有非空文本）
  const questionParts: string[] = [];
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

  // 合并多行问题文本
  const question = questionParts.join(' ');
  console.log('Parsed question:', question);

  // 提取选项（从 [Options] 后的所有内容）
  const options: Array<{ key: string; text: string }> = [];
  const optionRegex = /^([a-d])\)\s*(.+)/;

  for (let i = optionsIndex + 1; i < paragraphs.length; i++) {
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

interface ErrorState {
  type: 'FETCH_FAILED' | 'PARSE_FAILED' | 'FORMAT_MISMATCH' | 'NO_CONTENT';
  message: string;
}

const DetailCardPageImpl = () => {
  const t = useI18n();
  const { pageId } = useParams();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [currentCard, setCurrentCard] = useState<FlashcardData | null>(null);
  const [error, setError] = useState<ErrorState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 获取文档服务
  const { docService } = useServices({ DocService });
  const doc = docService.doc;

  // 从文档中解析卡片数据
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    if (!doc || !doc.blockSuiteDoc) {
      setError({
        type: 'FETCH_FAILED',
        message:
          t['com.affine.flashcard.error.fetch-failed']?.() ||
          'Failed to load card content from server',
      });
      setIsLoading(false);
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

      // 检查是否有内容
      if (paragraphs.every(p => !p.trim())) {
        setError({
          type: 'NO_CONTENT',
          message:
            t['com.affine.flashcard.error.no-content']?.() ||
            'No content found in this card',
        });
        setIsLoading(false);
        return;
      }

      // 解析内容
      const parsedCard = parseCardContent(paragraphs, doc.id);
      if (parsedCard) {
        setCurrentCard(parsedCard);
        setError(null);
      } else {
        // 格式不匹配错误
        setError({
          type: 'FORMAT_MISMATCH',
          message:
            t['com.affine.flashcard.error.format-mismatch']?.() ||
            'Card content format is incorrect. Expected single-choice format.',
        });
      }
    } catch (error) {
      console.error('Error parsing card content:', error);
      setError({
        type: 'PARSE_FAILED',
        message:
          t['com.affine.flashcard.error.parse-failed']?.() ||
          'Failed to parse card content',
      });
    } finally {
      setIsLoading(false);
    }
  }, [doc, t]);

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

  // 显示加载状态
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <PageDetailLoading />
        </div>
      </div>
    );
  }

  // 显示错误状态
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2 className={styles.errorTitle}>
            {t['com.affine.flashcard.error.title']?.() || 'Unable to Load Card'}
          </h2>
          <p className={styles.errorMessage}>{error.message}</p>
          {error.type === 'FORMAT_MISMATCH' && (
            <div className={styles.errorHint}>
              <p>
                {t['com.affine.flashcard.error.format-hint']?.() ||
                  'Expected format:'}
              </p>
              <pre className={styles.formatExample}>
                [single-choice] [Question] What is your question? [Options] a)
                Option A b) Option B c) Option C d) Option D
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return null;
  }

  return (
    <div className={styles.container}>
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
