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
import { getSurfaceBlock } from '@blocksuite/affine/blocks/surface';
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

// type MindmapNode = {
//   text: string;
//   children: MindmapNode[];
//   xywh?: string;
// };

// Parse markdown list to mindmap node structure
// const parseMarkdownToMindmapNode = (markdown: string): MindmapNode | null => {
//   const lines = markdown.split('\n');
//   const root: MindmapNode = { text: 'Root', children: [] };
//   const stack: { node: MindmapNode; level: number }[] = [{ node: root, level: -1 }];

//   for (const line of lines) {
//     const trimmed = line.trimEnd();
//     if (!trimmed) continue;

//     // Count leading spaces/dashes to determine level
//     const match = trimmed.match(/^(\s*)[-*]\s+(.+)$/);
//     if (!match) continue;

//     const [, indent, text] = match;
//     const level = indent.length / 2; // Assuming 2 spaces per level

//     const newNode: MindmapNode = { text, children: [] };

//     // Find parent at the appropriate level
//     while (stack.length > 1 && stack[stack.length - 1].level >= level) {
//       stack.pop();
//     }

//     // Add to parent's children
//     const parent = stack[stack.length - 1];
//     parent.node.children.push(newNode);

//     // Add to stack for potential children
//     stack.push({ node: newNode, level });
//   }

//   // Return the first child as root (skip our artificial root)
//   return root.children.length > 0 ? root.children[0] : null;
// };

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

  // Function to create mindmap from materials
  const createMindmap = useCallback(
    async (
      _materialIds: string[],
      materials: MaterialItem[]
    ): Promise<string | null> => {
      let tempDoc: any = null;
      let releaseTempDoc: (() => void) | null = null;

      try {
        // Create temporary doc for AI session
        tempDoc = docsService.createDoc({ primaryMode: 'page' });
        const { release } = docsService.open(tempDoc.id);
        releaseTempDoc = release;

        // TODO: Uncomment for production
        // const { prompt, attachments } = await buildMindmapPrompt(materials);
        // const aiResponse = await AIProvider.actions.chat({
        //   input: prompt,
        //   workspaceId: workspaceService.workspace.id,
        //   docId: tempDoc.id,
        //   attachments: attachments.length > 0 ? attachments : undefined,
        //   stream: true,
        // });
        // const markdownContent = await processAIResponse(aiResponse);

        // Create edgeless document for mindmap
        const mindmapDoc = docsService.createDoc({ primaryMode: 'edgeless' });
        const { doc: edgelessDoc, release: releaseEdgeless } = docsService.open(
          mindmapDoc.id
        );

        // Wait for doc to be ready
        await edgelessDoc.waitForSyncReady();
        const blockSuiteDoc = edgelessDoc.blockSuiteDoc;

        // Get surface block
        const surface = getSurfaceBlock(blockSuiteDoc);
        if (surface) {
          // Add a text note with instructions
          const noteId = blockSuiteDoc.addBlock(
            'affine:note',
            {
              xywh: '[100, 100, 400, 200]',
            },
            blockSuiteDoc.root?.id
          );

          if (noteId) {
            const noteBlock = blockSuiteDoc.getBlock(noteId);
            if (noteBlock?.model) {
              blockSuiteDoc.addBlock(
                'affine:paragraph',
                {
                  text: {
                    insert:
                      '📝 点击左侧工具栏的思维导图图标来创建您的思维导图\n\n素材：\n' +
                      materials.map(m => `• ${m.name}`).join('\n'),
                  },
                },
                noteBlock.model.id
              );
            }
          }
        }

        // Generate title for the mindmap
        const title = `Mindmap: ${materials.map(m => m.name).join(', ')}`;
        workspaceService.workspace.docCollection.meta.setDocMeta(
          mindmapDoc.id,
          { title }
        );

        // Add to MIND_MAPS collection
        const mindmapsCollection = collectionService.collection$(
          LEARNIFY_COLLECTIONS.MIND_MAPS
        ).value;

        if (mindmapsCollection) {
          collectionService.addDocToCollection(
            mindmapsCollection.id,
            mindmapDoc.id
          );
        }

        // Navigate to the new mindmap
        workbenchService.workbench.openDoc(mindmapDoc.id);

        // Clean up
        releaseEdgeless();

        return mindmapDoc.id;
      } catch (error) {
        console.error('[Mindmap] Failed to create mindmap:', error);
        throw error;
      } finally {
        // Always clean up temp doc
        cleanupTempDoc(tempDoc, releaseTempDoc);
      }
    },
    [
      cleanupTempDoc,
      collectionService,
      workspaceService,
      workbenchService,
      docsService,
    ]
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

  // Build AI prompt from materials for notes
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

  // Build AI prompt from materials for flashcards
  const buildFlashcardsPrompt = useCallback(
    async (
      materials: MaterialItem[]
    ): Promise<{ prompt: string; attachments: Blob[] }> => {
      const promptParts: string[] = [
        'Please create EXACTLY 10 flashcards from the following materials. Return them as a JSON array where each item has this structure:\n',
      ];
      const attachments: Blob[] = [];

      // Add format specification
      promptParts.push('\n```json');
      promptParts.push('[');
      promptParts.push('  {');
      promptParts.push('    "type": "flashcard",');
      promptParts.push('    "question": "Your question here",');
      promptParts.push('    "answer": "Your answer here"');
      promptParts.push('  },');
      promptParts.push('  {');
      promptParts.push('    "type": "single-choice",');
      promptParts.push('    "question": "Your question here",');
      promptParts.push('    "options": [');
      promptParts.push('      "a) Option 1",');
      promptParts.push('      "b) Option 2",');
      promptParts.push('      "c) Option 3",');
      promptParts.push('      "d) Option 4"');
      promptParts.push('    ],');
      promptParts.push('    "answer": "b"');
      promptParts.push('  }');
      promptParts.push(']');
      promptParts.push('```');

      promptParts.push('\n\nMATERIALS TO CONVERT:');

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

      promptParts.push('\n\nREQUIREMENTS:');
      promptParts.push('1. Create EXACTLY 10 flashcards total');
      promptParts.push(
        '2. Mix both "flashcard" and "single-choice" types (aim for 5 of each)'
      );
      promptParts.push('3. Return ONLY valid JSON array with 10 items');
      promptParts.push(
        '4. For single-choice cards, always provide exactly 4 options (a, b, c, d)'
      );
      promptParts.push(
        '5. For single-choice cards, answer must be a single letter (a, b, c, or d)'
      );
      promptParts.push('6. Make questions clear and answers comprehensive');
      promptParts.push('7. Cover different aspects of the material');
      promptParts.push(
        '\nReturn ONLY the JSON array, no other text or formatting.'
      );

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

  // Parse flashcards from JSON and create individual documents
  const parseAndCreateFlashcards = useCallback(
    async (
      jsonContent: string,
      materials: MaterialItem[]
    ): Promise<string[]> => {
      const docIds: string[] = [];

      try {
        // Try to extract JSON from the response
        let flashcardsData: any[];

        // Try to find JSON array in the content
        const jsonMatch = jsonContent.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
          flashcardsData = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: try to parse the whole content as JSON
          flashcardsData = JSON.parse(jsonContent);
        }

        // Validate we have an array with 10 items
        if (!Array.isArray(flashcardsData)) {
          throw new Error('Response is not a valid array of flashcards');
        }

        // Get flashcards collection
        const flashcardsCollection = collectionService.collection$(
          LEARNIFY_COLLECTIONS.FLASHCARDS
        ).value;

        // Create a document for each flashcard
        for (let i = 0; i < Math.min(flashcardsData.length, 10); i++) {
          const card = flashcardsData[i];
          let cardContent = '';
          let title = '';

          if (card.type === 'flashcard') {
            // Format as flashcard
            cardContent = `[flashcard]\n[Question]\n${card.question}\n[Answer]\n${card.answer}`;
            title = `Card ${i + 1}: ${card.question.substring(0, 50)}${card.question.length > 50 ? '...' : ''}`;
          } else if (card.type === 'single-choice') {
            // Format as single-choice quiz
            const optionsText = card.options ? card.options.join('\n') : '';
            cardContent = `[single-choice]\n[Question]\n${card.question}\n[Options]\n${optionsText}\n[Answer]\n${card.answer}`;
            title = `Quiz ${i + 1}: ${card.question.substring(0, 50)}${card.question.length > 50 ? '...' : ''}`;
          } else {
            // Skip invalid card types
            continue;
          }

          // Create document for this flashcard
          const docId = await MarkdownTransformer.importMarkdownToDoc({
            collection: workspaceService.workspace.docCollection,
            schema: getAFFiNEWorkspaceSchema(),
            markdown: cardContent,
            fileName: title,
            extensions: getStoreManager().config.init().value.get('store'),
          });

          if (docId) {
            docIds.push(docId);

            // Add to FLASHCARDS collection
            if (flashcardsCollection) {
              collectionService.addDocToCollection(
                flashcardsCollection.id,
                docId
              );
            }
          }
        }

        // If we created less than 10 cards, create empty placeholders
        const cardsCreated = docIds.length;
        if (cardsCreated < 10) {
          const materialName = materials[0]?.name || 'Materials';
          for (let i = cardsCreated; i < 10; i++) {
            const placeholderContent = `[flashcard]\n[Question]\nFlashcard ${i + 1} from ${materialName}\n[Answer]\nPlease edit this flashcard with your content.`;
            const title = `Card ${i + 1}: Placeholder`;

            const docId = await MarkdownTransformer.importMarkdownToDoc({
              collection: workspaceService.workspace.docCollection,
              schema: getAFFiNEWorkspaceSchema(),
              markdown: placeholderContent,
              fileName: title,
              extensions: getStoreManager().config.init().value.get('store'),
            });

            if (docId) {
              docIds.push(docId);
              if (flashcardsCollection) {
                collectionService.addDocToCollection(
                  flashcardsCollection.id,
                  docId
                );
              }
            }
          }
        }

        return docIds;
      } catch (error) {
        console.error('Failed to parse flashcards JSON:', error);
        throw new Error('Failed to parse flashcards from AI response');
      }
    },
    [collectionService, workspaceService]
  );

  // Function to create flashcards from materials
  const createFlashcards = useCallback(
    async (
      _materialIds: string[],
      materials: MaterialItem[]
    ): Promise<string[] | null> => {
      let tempDoc: any = null;
      let releaseTempDoc: (() => void) | null = null;

      try {
        // Build prompt and get attachments
        const { prompt, attachments } = await buildFlashcardsPrompt(materials);

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

        // Parse the JSON response and create individual flashcard documents
        const docIds = await parseAndCreateFlashcards(
          generatedContent,
          materials
        );

        // Navigate to the first created document
        if (docIds.length > 0) {
          workbenchService.workbench.openDoc(docIds[0]);
        }

        return docIds.length > 0 ? docIds : null;
      } catch (error) {
        console.error('Failed to create flashcards:', error);
        throw error;
      } finally {
        // Always clean up temp doc
        cleanupTempDoc(tempDoc, releaseTempDoc);
      }
    },
    [
      buildFlashcardsPrompt,
      processAIResponse,
      parseAndCreateFlashcards,
      cleanupTempDoc,
      workspaceService,
      workbenchService,
      docsService,
    ]
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
      mindmap: async () => {
        await createMindmap(materialIds, selectedMaterials);
      },
      notes: async () => {
        await createNotes(materialIds, selectedMaterials);
      },
      flashcards: async () => {
        await createFlashcards(materialIds, selectedMaterials);
      },
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
          {t.t('com.affine.confirmModal.button.cancel')}
        </Button>
        <Button
          variant="primary"
          onClick={() => void handleCreate()}
          disabled={selectedOptions.size === 0}
        >
          {t.t('com.learnify.material-creation.create-from-materials')}{' '}
          {selectedOptions.size > 0 && `(${selectedOptions.size})`}
        </Button>
      </div>
    </Modal>
  );
};
