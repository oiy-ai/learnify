import { Button, Modal } from '@affine/component';
import { LEARNIFY_COLLECTIONS } from '@affine/core/constants/learnify-collections';
import { CollectionService } from '@affine/core/modules/collection';
import type { DialogComponentProps } from '@affine/core/modules/dialogs';
import { DocsService } from '@affine/core/modules/doc';
import { WorkspaceService } from '@affine/core/modules/workspace';
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

export const MaterialCreationDialog = ({
  materialIds,
  close,
}: DialogComponentProps<MaterialCreationDialogProps>) => {
  const t = useI18n();
  const materialsService = useService(MaterialsDocService);
  const _workspaceService = useService(WorkspaceService);
  const docsService = useService(DocsService);
  const collectionService = useService(CollectionService);
  const allMaterials = useLiveData(materialsService.materials$);

  // Filter materials based on provided IDs
  const selectedMaterials = allMaterials.filter(material =>
    materialIds.includes(material.id)
  );

  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(
    new Set()
  );

  // Function to create mindmap from materials
  const createMindmap = useCallback(
    (materialIds: string[], materials: MaterialItem[]) => {
      console.log('Creating mindmap from material IDs:', materialIds);
      console.log('Material objects:', materials);
      // TODO: Implement mindmap creation logic
    },
    []
  );

  // Function to create notes from materials
  const createNotes = useCallback(
    async (materialIds: string[], materials: MaterialItem[]) => {
      console.log('Creating notes from material IDs:', materialIds);
      console.log('Material objects:', materials);

      try {
        // 1. Create a new document
        const newDoc = docsService.createDoc({
          primaryMode: 'page',
        });

        // 2. Add the document to the NOTES collection
        const notesCollection = collectionService.collection$(
          LEARNIFY_COLLECTIONS.NOTES
        ).value;
        if (notesCollection) {
          collectionService.addDocToCollection(notesCollection.id, newDoc.id);
        }

        // 3. Open the document and add content
        const { doc, release } = docsService.open(newDoc.id);
        const blockSuiteDoc = doc.blockSuiteDoc;

        // 4. Get the root note block
        const rootBlocks = blockSuiteDoc.getBlocksByFlavour('affine:note');
        const noteBlock = rootBlocks[0];

        if (noteBlock) {
          // 5. Create content from materials
          let content = `# Notes from Materials\n\n`;

          materials.forEach((material, index) => {
            content += `## ${index + 1}. ${material.name}\n\n`;
            content += `**Type**: ${material.category}\n\n`;
            if (material.description) {
              content += `**Description**: ${material.description}\n\n`;
            }
            content += `---\n\n`;
          });

          // 6. Add content to the note
          // For now, just log the content
          console.log('Note content:', content);
          // TODO: Use insertFromMarkdown or similar to add content
        }

        release();

        console.log('Note created successfully with ID:', newDoc.id);
        return newDoc.id;
      } catch (error) {
        console.error('Failed to create notes:', error);
        throw error;
      }
    },
    [docsService, collectionService]
  );

  // Function to create flashcards from materials
  const createFlashcards = useCallback(
    (materialIds: string[], materials: MaterialItem[]) => {
      console.log('Creating flashcards from material IDs:', materialIds);
      console.log('Material objects:', materials);
      // TODO: Implement flashcards creation logic
    },
    []
  );

  // Function to create podcast from materials
  const createPodcast = useCallback(
    (materialIds: string[], materials: MaterialItem[]) => {
      console.log('Creating podcast from material IDs:', materialIds);
      console.log('Material objects:', materials);
      // TODO: Implement podcast creation logic
    },
    []
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

  const handleCreate = useCallback(async () => {
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
    for (const optionId of selectedOptions) {
      try {
        switch (optionId) {
          case 'mindmap':
            createMindmap(materialIds, selectedMaterials);
            break;
          case 'notes':
            await createNotes(materialIds, selectedMaterials);
            break;
          case 'flashcards':
            createFlashcards(materialIds, selectedMaterials);
            break;
          case 'podcast':
            createPodcast(materialIds, selectedMaterials);
            break;
        }
      } catch (error) {
        console.error(`Failed to create ${optionId}:`, error);
      }
    }

    close();
  }, [
    close,
    materialIds,
    selectedMaterials,
    selectedOptions,
    createMindmap,
    createNotes,
    createFlashcards,
    createPodcast,
  ]);

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
          onClick={() => void handleCreate()}
          disabled={selectedOptions.size === 0}
        >
          {t['com.learnify.material-creation.create-from-materials']()}{' '}
          {selectedOptions.size > 0 && `(${selectedOptions.size})`}
        </Button>
      </div>
    </Modal>
  );
};
