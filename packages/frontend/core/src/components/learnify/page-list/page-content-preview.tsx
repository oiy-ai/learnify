import { DocsSearchService } from '@affine/core/modules/docs-search';
import { WorkspaceService } from '@affine/core/modules/workspace';
import { LiveData, useLiveData, useService } from '@toeverything/infra';
import { type ReactNode, useEffect, useMemo } from 'react';

import * as styles from './group-definitions.css';

interface PagePreviewProps {
  pageId: string;
  emptyFallback?: ReactNode;
  fallback?: ReactNode;
  rawType?: 'flashcards' | 'mind-maps';
}

interface FlashcardPreviewProps {
  question: string;
  options: Array<{ label: string; text: string }>;
}

const FlashcardPreview = ({ question, options }: FlashcardPreviewProps) => {
  return (
    <div className={styles.flashcardContainer}>
      <div className={styles.flashcardQuestion}>{question}</div>
      <div className={styles.flashcardOptionsContainer}>
        {options.map((option, index) => (
          <button key={index} className={styles.flashcardOption}>
            {option.label.toUpperCase()}) {option.text}
          </button>
        ))}
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
  // 如果不是字符串，直接返回原内容
  if (typeof content !== 'string') {
    return content;
  }

  let postprocessor: ReactNode = content;

  if (content.startsWith('single-choice')) {
    // summary go like this: single-choice questionxxxx a)xxx b)xxx c)xxx d)xxx
    // we need to extract the question and the options, then return a template with the question and the options
    const contentStr = content.replace('single-choice', '').trim();

    // Extract question (everything before the first option)
    const questionMatch = contentStr.match(/^(.*?)(?=\s*[a-d]\))/);
    const question = questionMatch ? questionMatch[1].trim() : '';

    // Extract options by finding all option patterns
    const optionMatches = [...contentStr.matchAll(/([a-d])\)\s*/g)];
    const options: Array<{ label: string; text: string }> = [];

    for (let i = 0; i < optionMatches.length; i++) {
      const currentMatch = optionMatches[i];
      const nextMatch = optionMatches[i + 1];

      const startIndex = currentMatch.index! + currentMatch[0].length;
      const endIndex = nextMatch ? nextMatch.index! : contentStr.length;

      const optionText = contentStr.slice(startIndex, endIndex).trim();

      options.push({
        label: currentMatch[1],
        text: optionText,
      });
    }

    // Return flashcard component with question and option buttons
    if (question && options.length > 0) {
      postprocessor = (
        <FlashcardPreview question={question} options={options} />
      );
    } else {
      postprocessor = contentStr; // fallback to original content if parsing fails
    }
  }

  if (content.startsWith('multiple-choice')) {
    postprocessor = 'BBB';
  }

  if (content.startsWith('fill-in-the-blank')) {
    postprocessor = 'CCC';
  }

  return postprocessor;
}
