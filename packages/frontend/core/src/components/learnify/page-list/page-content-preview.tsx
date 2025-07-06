import { DocsSearchService } from '@affine/core/modules/docs-search';
import { WorkspaceService } from '@affine/core/modules/workspace';
import { LiveData, useLiveData, useService } from '@toeverything/infra';
import { type ReactNode, useEffect, useMemo } from 'react';

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
    <div style={{ padding: '12px', fontSize: '14px' }}>
      <div
        style={{ marginBottom: '16px', fontWeight: '500', lineHeight: '1.5' }}
      >
        {question}
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {options.map((option, index) => (
          <button
            key={index}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              backgroundColor: '#f8f9fa',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '60px',
              textAlign: 'center',
            }}
            onMouseOver={e => {
              e.currentTarget.style.backgroundColor = '#e9ecef';
              e.currentTarget.style.borderColor = '#ced4da';
            }}
            onMouseOut={e => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
              e.currentTarget.style.borderColor = '#e0e0e0';
            }}
          >
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

    // Extract options using regex

    const optionsRegex = /([a-d])\)\s*([^a-d)]*?)(?=\s*[a-d]\)|$)/g;
    const options: Array<{ label: string; text: string }> = [];
    let match;

    while ((match = optionsRegex.exec(contentStr)) !== null) {
      options.push({
        label: match[1],
        text: match[2].trim(),
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
