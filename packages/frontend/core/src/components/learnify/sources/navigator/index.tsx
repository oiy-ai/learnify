import { Checkbox, useConfirmModal } from '@affine/component';
import type { SourceItem } from '@affine/core/modules/learnify';
import { SourcesStore } from '@affine/core/modules/learnify';
import { Trans, useI18n } from '@affine/i18n';
import {
  AttachmentIcon,
  ExportToPdfIcon,
  ImageIcon,
  LinkIcon,
} from '@blocksuite/icons/rc';
import { useLiveData, useService } from '@toeverything/infra';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ListFloatingToolbar } from '../../../page-list/components/list-floating-toolbar';
import { ImageViewerModal } from '../image-viewer-modal';
import { PDFViewerModal } from '../pdf-viewer-modal';
import * as styles from './index.css';

interface SourceCardProps {
  id: string;
  name: string;
  category: string;
  url?: string;
  checked: boolean;
  description: string;
  // eslint-disable-next-line no-unused-vars
  onCheckedChange: (id: string, checked: boolean) => void;
  // eslint-disable-next-line no-unused-vars
  onClick?: (id: string) => void;
}

const SourceCard = ({
  id,
  name,
  category,
  checked,
  description,
  onCheckedChange,
  onClick,
}: SourceCardProps) => {
  const getIcon = () => {
    switch (category) {
      case 'pdf':
        return <ExportToPdfIcon className={styles.sourceIcon} />;
      case 'image':
        return <ImageIcon className={styles.sourceIcon} />;
      case 'link':
        // Video links
        return <LinkIcon className={styles.sourceIcon} />;
      case 'attachment':
        return <AttachmentIcon className={styles.sourceIcon} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.sourceCard} onClick={() => onClick?.(id)}>
      <Checkbox
        className={styles.checkbox}
        checked={checked}
        onChange={() => {
          onCheckedChange(id, !checked);
        }}
      />
      {getIcon()}
      <div className={styles.sourceInfo}>
        <div className={styles.sourceName}>{name}</div>
        <div className={styles.sourceDescription}>{description}</div>
      </div>
    </div>
  );
};

export const NavigationPanelSources = () => {
  const t = useI18n();
  const sourcesStore = useService(SourcesStore);
  const sources = useLiveData(sourcesStore.sources$);
  const [checkedSources, setCheckedSources] = useState<Record<string, boolean>>(
    {}
  );
  const { openConfirmModal } = useConfirmModal();
  const [pdfModalSource, setPdfModalSource] = useState<SourceItem | null>(null);
  const [imageModalSource, setImageModalSource] = useState<SourceItem | null>(
    null
  );

  // Refresh sources when component mounts
  useEffect(() => {
    sourcesStore.refreshSources().catch(() => {
      // Silently fail
    });
  }, [sourcesStore]);

  const selectedSourceIds = useMemo(() => {
    return Object.keys(checkedSources).filter(id => checkedSources[id]);
  }, [checkedSources]);

  const hasSelection = selectedSourceIds.length > 0;

  const handleCheckedChange = (id: string, checked: boolean) => {
    setCheckedSources(prev => ({
      ...prev,
      [id]: checked,
    }));
  };

  const handleCloseFloatingToolbar = useCallback(() => {
    setCheckedSources({});
  }, []);

  const handleDeleteSources = useCallback(() => {
    openConfirmModal({
      title: t['com.affine.moveToTrash.confirmModal.title.multiple']({
        number: selectedSourceIds.length.toString(),
      }),
      description: t[
        'com.affine.moveToTrash.confirmModal.description.multiple'
      ]({
        number: selectedSourceIds.length.toString(),
      }),
      cancelText: t['com.affine.confirmModal.button.cancel'](),
      confirmText: t.Delete(),
      confirmButtonOptions: {
        variant: 'error',
      },
      onConfirm: async () => {
        // Delete all selected sources (including their blobs)
        await Promise.all(
          selectedSourceIds.map(id => sourcesStore.removeSource(id))
        );
        setCheckedSources({});
      },
    });
  }, [selectedSourceIds, sourcesStore, openConfirmModal, t]);

  const handleClick = useCallback(
    (sourceId: string) => {
      const source = sources?.find(s => s.id === sourceId);
      if (!source) return;

      if (source.category === 'link' && source.url) {
        // Open link in new tab
        window.open(source.url, '_blank');
      } else if (source.category === 'pdf') {
        // Open PDF viewer modal
        setPdfModalSource(source);
      } else if (source.category === 'image') {
        // Open image viewer modal
        setImageModalSource(source);
      }
    },
    [sources]
  );

  // If no sources uploaded yet, show a helpful message
  if (!sources || sources.length === 0) {
    return (
      <div className={styles.sourcesContainer}>
        <div
          style={{
            padding: '24px',
            textAlign: 'center',
            color: 'var(--affine-text-secondary-color)',
            fontSize: '14px',
          }}
        >
          No reference materials uploaded yet.
          <br />
          Use the upload button above to add PDFs, images, or other files.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.sourcesContainer}>
        {sources.map(source => (
          <SourceCard
            key={source.id}
            id={source.id}
            name={source.name}
            category={source.category}
            url={source.url}
            description={source.description}
            checked={checkedSources[source.id] || false}
            onCheckedChange={handleCheckedChange}
            onClick={handleClick}
          />
        ))}
      </div>
      <ListFloatingToolbar
        open={hasSelection}
        onDelete={handleDeleteSources}
        onClose={handleCloseFloatingToolbar}
        content={
          <Trans
            i18nKey="com.affine.page.toolbar.selected"
            count={selectedSourceIds.length}
          >
            <div style={{ color: 'var(--affine-text-secondary)' }}>
              {{ count: selectedSourceIds.length } as any}
            </div>
            selected
          </Trans>
        }
      />
      {pdfModalSource && (
        <PDFViewerModal
          source={pdfModalSource}
          open={!!pdfModalSource}
          onOpenChange={() => {
            setPdfModalSource(null);
          }}
        />
      )}
      {imageModalSource && (
        <ImageViewerModal
          source={imageModalSource}
          open={!!imageModalSource}
          onOpenChange={() => {
            setImageModalSource(null);
          }}
        />
      )}
    </>
  );
};
