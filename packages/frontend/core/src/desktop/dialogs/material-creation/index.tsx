import { Button, Modal } from '@affine/component';
import type { DialogComponentProps } from '@affine/core/modules/dialogs';
import { useI18n } from '@affine/i18n';
import {
  EdgelessIcon,
  FlashPanelIcon,
  MindmapIcon,
  PlayIcon,
} from '@blocksuite/icons/rc';
import { useLiveData, useService } from '@toeverything/infra';
import { useCallback, useState } from 'react';

import type { MaterialItem } from '../../../components/learnify/sources/services/materials-doc';
import { MaterialsDocService } from '../../../components/learnify/sources/services/materials-doc';
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

// Function to create mindmap from materials
const createMindmap = (materialIds: string[], materials: MaterialItem[]) => {
  console.log('Creating mindmap from material IDs:', materialIds);
  console.log('Material objects:', materials);
  // TODO: Implement mindmap creation logic
};

// Function to create notes from materials
const createNotes = (materialIds: string[], materials: MaterialItem[]) => {
  console.log('Creating notes from material IDs:', materialIds);
  console.log('Material objects:', materials);
  // TODO: Implement notes creation logic
};

// Function to create flashcards from materials
const createFlashcards = (materialIds: string[], materials: MaterialItem[]) => {
  console.log('Creating flashcards from material IDs:', materialIds);
  console.log('Material objects:', materials);
  // TODO: Implement flashcards creation logic
};

// Function to create podcast from materials
const createPodcast = (materialIds: string[], materials: MaterialItem[]) => {
  console.log('Creating podcast from material IDs:', materialIds);
  console.log('Material objects:', materials);
  // TODO: Implement podcast creation logic
};

export const MaterialCreationDialog = ({
  materialIds,
  close,
}: DialogComponentProps<MaterialCreationDialogProps>) => {
  const t = useI18n();
  const materialsService = useService(MaterialsDocService);
  const allMaterials = useLiveData(materialsService.materials$);

  // Filter materials based on provided IDs
  const selectedMaterials = allMaterials.filter(material =>
    materialIds.includes(material.id)
  );

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
          createMindmap(materialIds, selectedMaterials);
          break;
        case 'notes':
          createNotes(materialIds, selectedMaterials);
          break;
        case 'flashcards':
          createFlashcards(materialIds, selectedMaterials);
          break;
        case 'podcast':
          createPodcast(materialIds, selectedMaterials);
          break;
      }
    });

    close();
  }, [close, materialIds, selectedMaterials, selectedOptions]);

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
          {t['com.learnify.material-creation.create-from-materials']()}{' '}
          {selectedOptions.size > 0 && `(${selectedOptions.size})`}
        </Button>
      </div>
    </Modal>
  );
};
