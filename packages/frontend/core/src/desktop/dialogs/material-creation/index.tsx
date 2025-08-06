import { Button, Modal } from '@affine/component';
import { getStoreManager } from '@affine/core/blocksuite/manager/store';
import { LEARNIFY_COLLECTIONS } from '@affine/core/constants/learnify-collections';
import { CollectionService } from '@affine/core/modules/collection';
import type { DialogComponentProps } from '@affine/core/modules/dialogs';
import { DocsService } from '@affine/core/modules/doc';
import { WorkbenchService } from '@affine/core/modules/workbench';
import {
  getAFFiNEWorkspaceSchema,
  WorkspaceService,
} from '@affine/core/modules/workspace';
import { useI18n } from '@affine/i18n';
import { MarkdownTransformer } from '@blocksuite/affine/widgets/linked-doc';
import {
  EdgelessIcon,
  FlashPanelIcon,
  MindmapIcon,
  PlayIcon,
} from '@blocksuite/icons/rc';
import { useLiveData, useService } from '@toeverything/infra';
import { useCallback, useState } from 'react';

import { StreamObjectSchema } from '../../../blocksuite/ai/components/ai-chat-messages';
import { AIProvider } from '../../../blocksuite/ai/provider';
import { mergeStreamContent } from '../../../blocksuite/ai/utils/stream-objects';
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
  const workspaceService = useService(WorkspaceService);
  const docsService = useService(DocsService);
  const collectionService = useService(CollectionService);
  const workbenchService = useService(WorkbenchService);
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

      let tempDoc: any = null;
      let releaseTempDoc: any = null;

      try {
        // Prepare the prompt for AI to summarize materials
        let prompt = `Please summarize the following materials into comprehensive notes:\n\n`;

        materials.forEach((material, index) => {
          prompt += `${index + 1}. ${material.name}\n`;
          prompt += `   Type: ${material.category}\n`;
          if (material.description) {
            prompt += `   Description: ${material.description}\n`;
          }
          prompt += `\n`;
        });

        prompt += `\nPlease create well-structured notes with:\n`;
        prompt += `- A clear title\n`;
        prompt += `- Main concepts and key points\n`;
        prompt += `- Important details from each material\n`;
        prompt += `- A summary section\n`;

        console.log('Calling AI with prompt:', prompt);

        // Create a temporary doc for the AI session context
        tempDoc = docsService.createDoc({ primaryMode: 'page' });
        console.log('Created temp doc for AI context:', tempDoc.id);

        // Open the temp doc to get access to its collection
        const { release } = docsService.open(tempDoc.id);
        releaseTempDoc = release;

        // Call AI to generate notes content with streaming
        const aiResponse = await AIProvider.actions.chat({
          input: prompt,
          workspaceId: workspaceService.workspace.id,
          docId: tempDoc.id,
          stream: true,
        });

        // Collect the AI response from stream
        let generatedContent = '';
        let title = 'Notes from Materials';
        const streamObjects = [];

        console.log('AI response type:', typeof aiResponse);

        if (
          aiResponse &&
          typeof aiResponse === 'object' &&
          Symbol.asyncIterator in aiResponse
        ) {
          // Handle streaming response
          console.log('Handling streaming response...');
          for await (const chunk of aiResponse) {
            try {
              // Parse the JSON chunk
              const parsed = StreamObjectSchema.parse(JSON.parse(chunk));
              streamObjects.push(parsed);
            } catch (e) {
              // If parsing fails, try treating it as plain text
              console.warn(
                'Failed to parse chunk as JSON, treating as text:',
                e
              );
              generatedContent += chunk;
            }
          }

          // Extract text content from stream objects
          if (streamObjects.length > 0) {
            generatedContent = mergeStreamContent(streamObjects);
          }
        } else if (typeof aiResponse === 'string') {
          generatedContent = aiResponse;
        } else {
          console.error('Unexpected AI response type:', aiResponse);
          throw new Error('Invalid AI response format');
        }

        // Extract title from the generated content (usually the first line)
        const lines = generatedContent.split('\n');
        if (lines.length > 0 && lines[0].startsWith('#')) {
          title = lines[0].replace(/^#+\s*/, '').trim();
        }

        console.log(
          'AI generated content preview:',
          generatedContent.substring(0, 200) + '...'
        );
        console.log('Extracted title:', title);

        // Create the document using MarkdownTransformer
        const docId = await MarkdownTransformer.importMarkdownToDoc({
          collection: workspaceService.workspace.docCollection,
          schema: getAFFiNEWorkspaceSchema(),
          markdown: generatedContent,
          fileName: title,
          extensions: getStoreManager().config.init().value.get('store'),
        });

        console.log('Document created with ID:', docId);

        if (docId) {
          // Add the document to the NOTES collection
          const notesCollection = collectionService.collection$(
            LEARNIFY_COLLECTIONS.NOTES
          ).value;
          if (notesCollection) {
            collectionService.addDocToCollection(notesCollection.id, docId);
            console.log('Document added to NOTES collection');
          }

          // Navigate to the newly created document
          workbenchService.workbench.openDoc(docId);
          console.log('Navigated to new document');
        }

        // Clean up temp doc
        releaseTempDoc();
        if (tempDoc) {
          try {
            workspaceService.workspace.docCollection.removeDoc(tempDoc.id);
            console.log('Cleaned up temp doc');
          } catch (e) {
            console.warn('Failed to clean up temp doc:', e);
          }
        }

        return docId;
      } catch (error) {
        console.error('Failed to create notes:', error);

        // Clean up temp doc on error
        if (releaseTempDoc) {
          releaseTempDoc();
        }
        if (tempDoc) {
          try {
            workspaceService.workspace.docCollection.removeDoc(tempDoc.id);
          } catch (e) {
            console.warn('Failed to clean up temp doc:', e);
          }
        }

        throw error;
      }
    },
    [collectionService, workspaceService, workbenchService, docsService]
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
