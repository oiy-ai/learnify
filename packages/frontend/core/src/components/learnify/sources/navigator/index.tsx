import { Checkbox, useConfirmModal } from '@affine/component';
import { WorkspaceDialogService } from '@affine/core/modules/dialogs';
import { Trans, useI18n } from '@affine/i18n';
import {
  AttachmentIcon,
  ExportToPdfIcon,
  ImageIcon,
  LinkIcon,
  PlayIcon,
} from '@blocksuite/icons/rc';
import { useLiveData, useService } from '@toeverything/infra';
import { useCallback, useMemo, useState } from 'react';

import { ListFloatingToolbar } from '../../../page-list/components/list-floating-toolbar';
import { ImageViewerModal } from '../image-viewer-modal';
import { PDFViewerModal } from '../pdf-viewer-modal';
import type { MaterialItem } from '../services/materials-doc';
import { MaterialsDocService } from '../services/materials-doc';
import * as styles from './index.css';

interface SourceCardProps {
  id: string;
  name: string;
  category: string;
  mimeType: string;
  url?: string;
  checked: boolean;
  description: string;

  onCheckedChange: (id: string, checked: boolean) => void;

  onClick?: (id: string) => void;
}

const SourceCard = ({
  id,
  name,
  category,
  mimeType,
  checked,
  description,
  onCheckedChange,
  onClick,
}: SourceCardProps) => {
  const getIcon = () => {
    // Check mimeType first for more specific icons
    if (mimeType === 'video/youtube') {
      return <PlayIcon className={styles.sourceIcon} />;
    }

    // Fall back to category-based icons
    switch (category) {
      case 'pdf':
        return <ExportToPdfIcon className={styles.sourceIcon} />;
      case 'image':
        return <ImageIcon className={styles.sourceIcon} />;
      case 'link':
        // General links (non-YouTube)
        return <LinkIcon className={styles.sourceIcon} />;
      case 'attachment':
        return <AttachmentIcon className={styles.sourceIcon} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.sourceCard}>
      <Checkbox
        className={styles.checkbox}
        checked={checked}
        onChange={() => {
          onCheckedChange(id, !checked);
        }}
        onClick={e => {
          e.stopPropagation();
        }}
      />
      <div className={styles.sourceContent} onClick={() => onClick?.(id)}>
        {getIcon()}
        <div className={styles.sourceInfo}>
          <div className={styles.sourceName}>{name}</div>
          <div className={styles.sourceDescription}>{description}</div>
        </div>
      </div>
    </div>
  );
};

export const NavigationPanelSources = () => {
  const t = useI18n();
  const materialsService = useService(MaterialsDocService);
  const workspaceDialogService = useService(WorkspaceDialogService);
  const materials = useLiveData(materialsService.materials$);
  const [checkedSources, setCheckedSources] = useState<Record<string, boolean>>(
    {}
  );
  const { openConfirmModal } = useConfirmModal();
  const [pdfModalSource, setPdfModalSource] = useState<MaterialItem | null>(
    null
  );
  const [imageModalSource, setImageModalSource] = useState<MaterialItem | null>(
    null
  );

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
        // Delete all selected materials
        await Promise.all(
          selectedSourceIds.map(id => materialsService.removeMaterial(id))
        );
        setCheckedSources({});
      },
    });
  }, [selectedSourceIds, materialsService, openConfirmModal, t]);

  const handleClick = useCallback(
    (sourceId: string) => {
      const source = materials?.find(s => s.id === sourceId);
      if (!source) return;

      if (source.category === 'link') {
        // For video links, we'd need to store URL in attachment metadata
        // For now, just show a message
        console.log('Video links not yet supported in this implementation');
      } else if (source.category === 'pdf') {
        // Open PDF viewer modal
        setPdfModalSource(source);
      } else if (source.category === 'image') {
        // Open image viewer modal
        setImageModalSource(source);
      }
    },
    [materials]
  );

  // If no materials uploaded yet, show a helpful message
  if (!materials || materials.length === 0) {
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
        {materials.map(source => (
          <SourceCard
            key={source.id}
            id={source.id}
            name={source.name}
            category={source.category}
            mimeType={source.mimeType}
            url={undefined}
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
        onAdd={() => {
          // Open the material creation dialog with selected material IDs
          workspaceDialogService.open('material-creation', {
            materialIds: selectedSourceIds,
          });
          // Clear selection after opening dialog
          setCheckedSources({});
        }}
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
