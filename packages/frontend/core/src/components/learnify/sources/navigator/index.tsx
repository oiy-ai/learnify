import { Checkbox } from '@affine/component';
import { SourcesStore } from '@affine/core/modules/learnify';
import { Trans } from '@affine/i18n';
import { ExportToPdfIcon, ImageIcon, LinkIcon } from '@blocksuite/icons/rc';
import { useLiveData, useService } from '@toeverything/infra';
import { useCallback, useMemo, useState } from 'react';

import { ListFloatingToolbar } from '../../../page-list/components/list-floating-toolbar';
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
}

const SourceCard = ({
  id,
  name,
  category,
  checked,
  description,
  onCheckedChange,
}: SourceCardProps) => {
  const getIcon = () => {
    switch (category) {
      case 'pdf':
        return <ExportToPdfIcon className={styles.sourceIcon} />;
      case 'image':
        return <ImageIcon className={styles.sourceIcon} />;
      case 'link':
        return <LinkIcon className={styles.sourceIcon} />;
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
  const sourcesStore = useService(SourcesStore);
  const sources = useLiveData(sourcesStore.sources$);
  const [checkedSources, setCheckedSources] = useState<Record<string, boolean>>(
    {}
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
    console.log('NavigationPanelSources: handleCloseFloatingToolbar called');
    setCheckedSources({});
  }, []);

  const handleDeleteSources = useCallback(async () => {
    console.log('NavigationPanelSources: handleDeleteSources called', {
      selectedSourceIds,
    });
    // Delete all selected sources (including their blobs)
    await Promise.all(
      selectedSourceIds.map(id => sourcesStore.removeSource(id))
    );
    setCheckedSources({});
  }, [selectedSourceIds, sourcesStore]);

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
          />
        ))}
      </div>
      <ListFloatingToolbar
        open={hasSelection}
        onDelete={() => void handleDeleteSources()}
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
    </>
  );
};
