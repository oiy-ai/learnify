import { Modal } from '@affine/component';
import { AttachmentViewer } from '@affine/core/blocksuite/attachment-viewer';
import { DocsService } from '@affine/core/modules/doc';
import type { SourceItem } from '@affine/core/modules/learnify';
import type { AttachmentBlockModel } from '@blocksuite/affine/model';
import { useService } from '@toeverything/infra';
import { useEffect, useState } from 'react';

import * as styles from './pdf-viewer-modal.css';

interface PDFViewerModalProps {
  source: SourceItem;
  open: boolean;
  onOpenChange: () => void;
}

export const PDFViewerModal = ({
  source,
  open,
  onOpenChange,
}: PDFViewerModalProps) => {
  const docsService = useService(DocsService);
  const [attachmentModel, setAttachmentModel] =
    useState<AttachmentBlockModel | null>(null);

  useEffect(() => {
    if (!open || !source.blobId) return;

    // Try to find the attachment block in the document
    const findAttachmentBlock = async () => {
      try {
        // The source document ID
        // cspell:disable-next-line
        const docId = 'Y3sx62lSB5Incw4BMyEFC';
        const { doc, release } = docsService.open(docId);

        await doc.waitForSyncReady();
        const blocksuiteDoc = doc.blockSuiteDoc;

        // Find the attachment block with matching sourceId
        const blocks = blocksuiteDoc.getBlocksByFlavour('affine:attachment');

        for (const block of blocks) {
          const model = block.model as AttachmentBlockModel;

          if (model.props.sourceId === source.blobId) {
            setAttachmentModel(model);
            break;
          }
        }

        release();
      } catch (err) {
        console.error('Failed to find attachment block:', err);
      }
    };

    findAttachmentBlock().catch(() => {
      // Error already logged in findAttachmentBlock
    });

    return () => {
      setAttachmentModel(null);
    };
  }, [open, source.blobId, docsService]);

  return (
    <Modal
      contentOptions={{
        className: styles.container,
      }}
      open={open}
      onOpenChange={onOpenChange}
      width="90%"
      height="90%"
    >
      {attachmentModel ? (
        <AttachmentViewer model={attachmentModel} />
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--affine-text-secondary-color)',
          }}
        >
          Loading PDF...
        </div>
      )}
    </Modal>
  );
};
