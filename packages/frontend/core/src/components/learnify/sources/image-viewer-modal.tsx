import { Modal } from '@affine/component';
import { WorkspaceService } from '@affine/core/modules/workspace';
import { useService } from '@toeverything/infra';
import { useEffect, useState } from 'react';

import * as styles from './image-viewer-modal.css';
import type { MaterialItem } from './services/materials-doc';

interface ImageViewerModalProps {
  source: MaterialItem;
  open: boolean;
  onOpenChange: () => void;
}

export const ImageViewerModal = ({
  source,
  open,
  onOpenChange,
}: ImageViewerModalProps) => {
  const workspaceService = useService(WorkspaceService);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !source.blobId) return;

    const loadImage = async () => {
      try {
        setLoading(true);
        const workspace = workspaceService.workspace;

        // Get blob through workspace engine
        const blobData = await workspace.engine.blob.get(source.blobId);

        if (blobData) {
          const blob = new Blob([blobData.data], { type: blobData.mime });
          const url = URL.createObjectURL(blob);
          setImageUrl(url);
        }
      } catch (err) {
        console.error('Failed to load image:', err);
      } finally {
        setLoading(false);
      }
    };

    loadImage().catch(() => {
      // Error already logged in loadImage
    });

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      setImageUrl(null);
    };
  }, [open, source.blobId, workspaceService, imageUrl]);

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
      {loading ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--affine-text-secondary-color)',
          }}
        >
          Loading image...
        </div>
      ) : imageUrl ? (
        <div className={styles.imageViewerContainer}>
          <div className={styles.imageWrapper}>
            <img src={imageUrl} alt={source.name} className={styles.image} />
          </div>
        </div>
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
          Failed to load image
        </div>
      )}
    </Modal>
  );
};
