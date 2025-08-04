import { Button, Modal } from '@affine/component';
import type { DialogComponentProps } from '@affine/core/modules/dialogs';
import { useI18n } from '@affine/i18n';
import {
  EdgelessIcon,
  FlashPanelIcon,
  MindmapIcon,
  PlayIcon,
} from '@blocksuite/icons/rc';
import { useCallback, useState } from 'react';

import * as styles from './index.css';

export interface MaterialCreationDialogProps {
  materialIds: string[];
}

const creationOptions = [
  {
    id: 'mindmap',
    name: '思维导图',
    icon: <MindmapIcon />,
    description: 'Organize knowledge in visual mind maps',
  },
  {
    id: 'notes',
    name: '笔记',
    icon: <EdgelessIcon />,
    description: 'Create structured notes from materials',
  },
  {
    id: 'flashcards',
    name: '闪回卡',
    icon: <FlashPanelIcon />,
    description: 'Generate flashcards for memorization',
  },
  {
    id: 'podcast',
    name: '播客',
    icon: <PlayIcon />,
    description: 'Convert materials into audio content',
  },
];

export const MaterialCreationDialog = ({
  materialIds,
  close,
}: DialogComponentProps<MaterialCreationDialogProps>) => {
  const t = useI18n();
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(
    new Set()
  );

  const handleOptionToggle = useCallback((optionId: string) => {
    setSelectedOptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(optionId)) {
        newSet.delete(optionId);
      } else {
        newSet.add(optionId);
      }
      return newSet;
    });
  }, []);

  const handleCreate = useCallback(() => {
    if (selectedOptions.size === 0) {
      return; // Nothing selected
    }

    console.log(
      'Creating content types:',
      Array.from(selectedOptions),
      'from materials:',
      materialIds
    );

    // Create content for each selected option
    selectedOptions.forEach(optionId => {
      switch (optionId) {
        case 'mindmap':
          // TODO: Call API to create mindmap from materials
          console.log('Creating mindmap from materials');
          break;
        case 'notes':
          // TODO: Call API to create notes from materials
          console.log('Creating notes from materials');
          break;
        case 'flashcards':
          // TODO: Call API to create flashcards from materials
          console.log('Creating flashcards from materials');
          break;
        case 'podcast':
          // TODO: Call API to create podcast from materials
          console.log('Creating podcast from materials');
          break;
      }
    });

    close();
  }, [close, materialIds, selectedOptions]);

  const handleCreateAll = useCallback(() => {
    // Select all options
    const allOptionIds = creationOptions.map(opt => opt.id);
    setSelectedOptions(new Set(allOptionIds));

    // Then create
    setTimeout(() => {
      handleCreate();
    }, 100);
  }, [handleCreate]);

  return (
    <Modal
      open
      onOpenChange={() => close()}
      width={520}
      contentOptions={{
        style: { padding: 0 },
      }}
    >
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>Create Content from Materials</h2>
        <p className={styles.modalDescription}>
          Choose how you want to process the selected materials
        </p>
      </div>

      <div className={styles.optionsGrid}>
        {creationOptions.map(option => (
          <div
            key={option.id}
            className={`${styles.optionCard} ${selectedOptions.has(option.id) ? styles.optionCardSelected : ''}`}
            onClick={() => handleOptionToggle(option.id)}
          >
            <div className={styles.optionIcon}>{option.icon}</div>
            <div className={styles.optionName}>{option.name}</div>
            <div className={styles.optionDescription}>{option.description}</div>
          </div>
        ))}
      </div>

      <div className={styles.modalFooter}>
        <Button variant="secondary" onClick={() => close()}>
          {t['com.affine.confirmModal.button.cancel']()}
        </Button>
        <Button
          variant="primary"
          onClick={handleCreate}
          disabled={selectedOptions.size === 0}
        >
          创建选中的内容{' '}
          {selectedOptions.size > 0 && `(${selectedOptions.size})`}
        </Button>
        <Button variant="primary" onClick={handleCreateAll}>
          全部创建
        </Button>
      </div>
    </Modal>
  );
};
