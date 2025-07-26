import { Modal } from '@affine/component';
import { AttachmentViewer } from '@affine/core/blocksuite/attachment-viewer';
import { DocsService } from '@affine/core/modules/doc';
import type { AttachmentBlockModel } from '@blocksuite/affine/model';
import { useService } from '@toeverything/infra';
import { useEffect, useState } from 'react';

import * as styles from './pdf-viewer-modal.css';
import type { MaterialItem } from './services/materials-doc';

interface PDFViewerModalProps {
  source: MaterialItem;
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

    // Try to find the attachment block in the materials document
    const findAttachmentBlock = async () => {
      try {
        // The materials document ID
        const docId = 'learnify-list-of-materials';
        const { doc, release } = docsService.open(docId);

        await doc.waitForSyncReady();
        const blocksuiteDoc = doc.blockSuiteDoc;

        // Find the attachment block with matching ID
        const block = blocksuiteDoc.getBlock(source.id);

        if (block?.flavour === 'affine:attachment') {
          setAttachmentModel(block.model as AttachmentBlockModel);
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
  }, [open, source.blobId, source.id, docsService]);

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
