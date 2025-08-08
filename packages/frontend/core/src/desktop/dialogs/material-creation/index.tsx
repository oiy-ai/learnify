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
import type { AttachmentBlockModel } from '@blocksuite/affine/model';
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
import { AIProvider } from '../../../blocksuite/ai/provider/ai-provider';
import { mergeStreamContent } from '../../../blocksuite/ai/utils/stream-objects';
import type { MaterialItem } from '../../../components/learnify/sources/services/materials-doc';
import { MaterialsDocService } from '../../../components/learnify/sources/services/materials-doc';
import * as styles from './index.css';

export interface MaterialCreationDialogProps {
  materialIds: string[];
}

type MaterialContent =
  | { type: 'text'; content: string }
  | { type: 'image'; content: Blob; name: string; description?: string };

type CreationOptionId = 'mindmap' | 'notes' | 'flashcards' | 'podcast';

const creationOptions: Array<{
  id: CreationOptionId;
  name: string;
  icon: React.ReactNode;
  description: string;
}> = [
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

  const [selectedOptions, setSelectedOptions] = useState<Set<CreationOptionId>>(
    new Set()
  );

  // Function to create mindmap from materials
  const createMindmap = useCallback(
    (_materialIds: string[], _materials: MaterialItem[]) => {
      // TODO: Implement mindmap creation logic
    },
    []
  );

  // Helper function to get content from materials
  const getMaterialContent = useCallback(
    async (material: MaterialItem): Promise<MaterialContent> => {
      // Handle attachments (images, PDFs)
      if (['image', 'pdf', 'attachment'].includes(material.category)) {
        const materialsDoc = await materialsService.getMaterialsDoc();
        if (!materialsDoc) {
          return {
            type: 'text' as const,
            content: `${material.name} (${material.category})`,
          };
        }

        const attachmentBlock = materialsDoc
          .getBlocksByFlavour('affine:attachment')
          .find(b => b.id === material.id);

        if (attachmentBlock) {
          const model = attachmentBlock.model as AttachmentBlockModel;
          const sourceId = model.props.sourceId;

          if (sourceId) {
            const blob = await materialsDoc.blobSync.get(sourceId);

            if (blob && material.category === 'image') {
              return {
                type: 'image' as const,
                content: blob,
                name: material.name,
                description: material.description,
              };
            }

            // For PDFs and other attachments, return metadata
            // TODO: Implement PDF text extraction
            if (blob) {
              return {
                type: 'text' as const,
                content: `File: ${material.name}\nType: ${material.mimeType}\nSize: ${material.size} bytes\nDescription: ${material.description || 'No description'}`,
              };
            }
          }
        }
      }

      // Handle links
      if (material.category === 'link') {
        return {
          type: 'text' as const,
          content: `Link: ${material.name}\nURL: ${material.blobId}\nDescription: ${material.description || 'No description'}`,
        };
      }

      // Default fallback
      return {
        type: 'text' as const,
        content: `${material.name} (${material.category})\nDescription: ${material.description || 'No description'}`,
      };
    },
    [materialsService]
  );

  // Build AI prompt from materials
  const buildPromptFromMaterials = useCallback(
    async (
      materials: MaterialItem[]
    ): Promise<{ prompt: string; attachments: Blob[] }> => {
      const promptParts: string[] = [
        'Please summarize the following materials into comprehensive notes:\n',
      ];
      const attachments: Blob[] = [];

      for (let i = 0; i < materials.length; i++) {
        const material = materials[i];
        const content = await getMaterialContent(material);

        promptParts.push(`\n${i + 1}. ${material.name}`);
        promptParts.push(`   Type: ${material.category}`);

        if (content.type === 'text') {
          promptParts.push(`   Content: ${content.content}`);
        } else if (content.type === 'image' && content.content) {
          const blob = new Blob([content.content], { type: 'image/png' });
          attachments.push(blob);
          promptParts.push(`   [Image ${attachments.length}]`);
          if (content.description) {
            promptParts.push(`   Description: ${content.description}`);
          }
        }
      }

      promptParts.push('\nPlease create well-structured notes with:');
      promptParts.push('- A clear title');
      promptParts.push('- Main concepts and key points');
      promptParts.push('- Important details from each material');
      promptParts.push('- A summary section');

      return {
        prompt: promptParts.join('\n'),
        attachments,
      };
    },
    [getMaterialContent]
  );

  // Process AI streaming response
  const processAIResponse = useCallback(
    async (aiResponse: any): Promise<string> => {
      if (!aiResponse) {
        throw new Error('No response from AI service');
      }

      // Handle streaming response
      if (
        typeof aiResponse === 'object' &&
        Symbol.asyncIterator in aiResponse
      ) {
        const streamObjects = [];
        let fallbackContent = '';

        for await (const chunk of aiResponse) {
          try {
            const parsed = StreamObjectSchema.parse(JSON.parse(chunk));
            streamObjects.push(parsed);
          } catch {
            // Fallback to plain text if JSON parsing fails
            fallbackContent += chunk;
          }
        }

        return streamObjects.length > 0
          ? mergeStreamContent(streamObjects)
          : fallbackContent;
      }

      // Handle string response
      if (typeof aiResponse === 'string') {
        return aiResponse;
      }

      throw new Error('Invalid AI response format');
    },
    []
  );

  // Extract title from markdown content
  const extractTitle = useCallback((content: string): string => {
    const lines = content.split('\n');
    const firstLine = lines[0] || '';

    if (firstLine.startsWith('#')) {
      return firstLine.replace(/^#+\s*/, '').trim();
    }

    return 'Notes from Materials';
  }, []);

  // Clean up temporary document
  const cleanupTempDoc = useCallback(
    (tempDoc: any, release: (() => void) | null) => {
      if (release) {
        release();
      }

      if (tempDoc) {
        try {
          workspaceService.workspace.docCollection.removeDoc(tempDoc.id);
        } catch {
          // Silently ignore cleanup errors
        }
      }
    },
    [workspaceService]
  );

  // Function to create notes from materials
  const createNotes = useCallback(
    async (
      _materialIds: string[],
      materials: MaterialItem[]
    ): Promise<string | null> => {
      let tempDoc: any = null;
      let releaseTempDoc: (() => void) | null = null;

      try {
        // Build prompt and get attachments
        const { prompt, attachments } =
          await buildPromptFromMaterials(materials);

        // Create temporary doc for AI session
        tempDoc = docsService.createDoc({ primaryMode: 'page' });
        const { release } = docsService.open(tempDoc.id);
        releaseTempDoc = release;

        // Check AI availability
        if (!AIProvider.actions.chat) {
          throw new Error(
            'AI service is not available. Please try again later.'
          );
        }

        // Call AI service
        const aiResponse = await AIProvider.actions.chat({
          input: prompt,
          workspaceId: workspaceService.workspace.id,
          docId: tempDoc.id,
          attachments: attachments.length > 0 ? attachments : undefined,
          stream: true,
        });

        // Process AI response
        const generatedContent = await processAIResponse(aiResponse);
        const title = extractTitle(generatedContent);

        // Create document from markdown
        const docId = await MarkdownTransformer.importMarkdownToDoc({
          collection: workspaceService.workspace.docCollection,
          schema: getAFFiNEWorkspaceSchema(),
          markdown: generatedContent,
          fileName: title,
          extensions: getStoreManager().config.init().value.get('store'),
        });

        if (docId) {
          // Add to NOTES collection
          const notesCollection = collectionService.collection$(
            LEARNIFY_COLLECTIONS.NOTES
          ).value;

          if (notesCollection) {
            collectionService.addDocToCollection(notesCollection.id, docId);
          }

          // Navigate to the new document
          workbenchService.workbench.openDoc(docId);
        }

        return docId || null;
      } catch (error) {
        console.error('Failed to create notes:', error);
        throw error;
      } finally {
        // Always clean up temp doc
        cleanupTempDoc(tempDoc, releaseTempDoc);
      }
    },
    [
      buildPromptFromMaterials,
      processAIResponse,
      extractTitle,
      cleanupTempDoc,
      collectionService,
      workspaceService,
      workbenchService,
      docsService,
    ]
  );

  // Function to create flashcards from materials
  const createFlashcards = useCallback(
    (_materialIds: string[], _materials: MaterialItem[]) => {
      // TODO: Implement flashcards creation logic
    },
    []
  );

  // Function to create podcast from materials
  const createPodcast = useCallback(
    (_materialIds: string[], _materials: MaterialItem[]) => {
      // TODO: Implement podcast creation logic
    },
    []
  );

  const handleOptionToggle = useCallback((optionId: CreationOptionId) => {
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
      return;
    }

    const creationHandlers: Record<CreationOptionId, () => Promise<void>> = {
      mindmap: async () => createMindmap(materialIds, selectedMaterials),
      notes: async () => {
        await createNotes(materialIds, selectedMaterials);
      },
      flashcards: async () => createFlashcards(materialIds, selectedMaterials),
      podcast: async () => createPodcast(materialIds, selectedMaterials),
    };

    // Process each selected option
    for (const optionId of selectedOptions) {
      try {
        await creationHandlers[optionId]();
      } catch (error) {
        console.error(`Failed to create ${optionId}:`, error);
        // Continue with other options even if one fails
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
            onClick={() => handleOptionToggle(option.id as CreationOptionId)}
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
