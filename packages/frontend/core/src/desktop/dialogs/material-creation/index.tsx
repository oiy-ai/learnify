import { Button, Modal, toast } from '@affine/component';
import { getStoreManager } from '@affine/core/blocksuite/manager/store';
import { LEARNIFY_COLLECTIONS } from '@affine/core/constants/learnify-collections';
import { CollectionService } from '@affine/core/modules/collection';
import type {
  DialogComponentProps,
  WORKSPACE_DIALOG_SCHEMA,
} from '@affine/core/modules/dialogs';
import { DocsService } from '@affine/core/modules/doc';
import { WorkbenchService } from '@affine/core/modules/workbench';
import {
  getAFFiNEWorkspaceSchema,
  WorkspaceService,
} from '@affine/core/modules/workspace';
import { createMindmap as createMindmapElement } from '@affine/core/utils/mindmap-creator';
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
import { AIGenerationOverlay } from '../../../components/learnify/ai-generation-overlay';
import { useAIGeneration } from '../../../components/learnify/ai-generation-overlay/use-ai-generation';
import type { MaterialItem } from '../../../components/learnify/sources/services/materials-doc';
import { MaterialsDocService } from '../../../components/learnify/sources/services/materials-doc';
import * as styles from './index.css';

type MaterialContent =
  | { type: 'text'; content: string }
  | { type: 'image'; content: Blob; name: string; description?: string }
  | { type: 'pdf'; content: Blob; name: string; description?: string };

type CreationOptionId = 'mindmap' | 'notes' | 'flashcards' | 'podcast';

const creationOptions: Array<{
  id: CreationOptionId;
  name: string;
  icon: React.ReactNode;
  description: string;
  disabled?: boolean;
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
    disabled: true,
  },
];

export const MaterialCreationDialog = ({
  materialIds,
  close,
}: DialogComponentProps<WORKSPACE_DIALOG_SCHEMA['material-creation']>) => {
  const t = useI18n();
  const materialsService = useService(MaterialsDocService);
  const workspaceService = useService(WorkspaceService);
  const workbenchService = useService(WorkbenchService);
  const docsService = useService(DocsService);
  const collectionService = useService(CollectionService);
  const allMaterials = useLiveData(materialsService.materials$);

  // Filter materials based on provided IDs
  const selectedMaterials = allMaterials.filter(material =>
    materialIds.includes(material.id)
  );

  const [selectedOptions, setSelectedOptions] = useState<Set<CreationOptionId>>(
    new Set()
  );

  // AI Generation state management
  const {
    isGenerating,
    progress,
    error,
    startGeneration,
    updateProgress,
    setProgress,
    cancel,
    retry,
  } = useAIGeneration({
    onSuccess: () => {
      // Clear selection after successful generation
      setSelectedOptions(new Set());
    },
    onError: err => {
      console.error('AI generation failed:', err);
    },
  });

  const [currentGenerationFn, setCurrentGenerationFn] = useState<
    (() => Promise<any>) | null
  >(null);

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

            // For PDFs, pass as blob for AI processing
            if (blob && material.category === 'pdf') {
              console.log(
                '[getMaterialContent] Processing PDF:',
                material.name,
                material.mimeType
              );
              return {
                type: 'pdf' as const,
                content: blob,
                name: material.name,
                description: material.description,
              } as MaterialContent & {
                type: 'pdf';
                content: Blob;
                name: string;
                description?: string;
              };
            }

            // For other attachments, return metadata
            if (blob) {
              console.log(
                '[getMaterialContent] Processing other attachment:',
                material.name,
                material.mimeType
              );
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
        } else if (content.type === 'pdf' && content.content) {
          console.log(
            '[buildPromptFromMaterials] Adding PDF attachment:',
            material.name
          );
          const blob = new Blob([content.content], { type: 'application/pdf' });
          attachments.push(blob);
          promptParts.push(`   [PDF Document ${attachments.length}]`);
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

  // Process AI response for mindmap
  const processAIMindmapResponse = useCallback(
    async (aiResponse: any): Promise<any> => {
      let content = '';

      // Handle streaming response - similar to processAIResponse for notes
      if (
        aiResponse &&
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

        content =
          streamObjects.length > 0
            ? mergeStreamContent(streamObjects)
            : fallbackContent;
      } else if (typeof aiResponse === 'string') {
        content = aiResponse;
      }

      // Try to extract JSON from the response
      try {
        // First, try to find a JSON object in the content
        // Look for JSON that starts with { and ends with }
        const jsonMatch = content.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[0];
          console.log('Found potential JSON:', jsonStr);
          return JSON.parse(jsonStr);
        }

        // If no JSON found, try parsing the entire content
        return JSON.parse(content);
      } catch (error) {
        console.error('Failed to parse mindmap JSON:', error);
        console.log('Content that failed to parse:', content);
      }

      return null;
    },
    []
  );

  // Function to create mindmap from a single material
  const createMindmap = useCallback(
    async (material: MaterialItem): Promise<string | null> => {
      let tempDoc: any = null;
      let releaseTempDoc: (() => void) | null = null;

      try {
        // Update progress to generating stage
        updateProgress('generating', 30, '正在使用 AI 生成思维导图结构...');

        // Step 1: Generate mindmap structure using AI
        let aiMindmapStructure;

        try {
          // Build prompt from single material
          const { prompt, attachments } = await buildPromptFromMaterials([
            material,
          ]);

          // Modify prompt for mindmap generation
          const mindmapPrompt = `${prompt}

Instead of creating notes, please create a mind map structure in JSON format with the following requirements:
1. Create a hierarchical knowledge structure based on the materials
2. Include core concepts, knowledge categories, and learning objectives
3. Each node should have clear hierarchical relationships
4. Return ONLY the JSON object, no markdown, no code blocks, just pure JSON:
{
  "text": "Main Topic",
  "children": [
    {
      "text": "Subtopic",
      "children": []
    }
  ]
}`;

          // Create temporary doc for AI session
          tempDoc = docsService.createDoc({ primaryMode: 'page' });
          const { release } = docsService.open(tempDoc.id);
          releaseTempDoc = release;

          // Check AI availability
          if (!AIProvider.actions.chat) {
            throw new Error('AI service is not available.');
          }

          // Call AI service with streaming
          const aiResponse = await AIProvider.actions.chat({
            input: mindmapPrompt,
            workspaceId: workspaceService.workspace.id,
            docId: tempDoc.id,
            attachments: attachments.length > 0 ? attachments : undefined,
            stream: true,
          });

          // Process AI response to get mindmap JSON
          updateProgress('processing', 60, '正在处理 AI 响应...');
          const mindmapStructure = await processAIMindmapResponse(aiResponse);

          if (mindmapStructure) {
            aiMindmapStructure = mindmapStructure;
          }
        } catch (aiError) {
          console.error('Failed to generate mindmap with AI:', aiError);
        } finally {
          // Clean up temp doc
          cleanupTempDoc(tempDoc, releaseTempDoc);
        }

        // Fallback to simple structure if AI fails
        if (!aiMindmapStructure) {
          aiMindmapStructure = {
            text: material.name || '学习资料知识图谱',
            children: [
              { text: `类型: ${material.category}`, children: [] },
              { text: material.description || '暂无描述', children: [] },
            ],
          };
        }

        // Step 2: Create edgeless document
        updateProgress('finalizing', 80, '正在创建思维导图文档...');
        const mindmapDoc = docsService.createDoc({ primaryMode: 'edgeless' });
        const { doc: edgelessDoc, release: releaseEdgeless } = docsService.open(
          mindmapDoc.id
        );

        // Step 3: Wait for doc to be ready
        await edgelessDoc.waitForSyncReady();
        const blockSuiteDoc = edgelessDoc.blockSuiteDoc;

        // Step 4: Create mindmap using the utility
        const mindmapId = await createMindmapElement(blockSuiteDoc, {
          tree: aiMindmapStructure,
          style: 1,
          layoutType: 0,
          xywh: '[0, 0, 1200, 900]',
        });

        if (mindmapId) {
          // Trigger layout after a delay to ensure proper rendering
          setTimeout(() => {
            try {
              const surface = getSurfaceBlock(blockSuiteDoc);
              if (surface) {
                const surfaceModel = surface as any;
                const mindmapElement = surfaceModel.getElementById?.(mindmapId);

                if (mindmapElement) {
                  // Ensure tree is built
                  mindmapElement.buildTree?.();
                  // Request layout with default options
                  mindmapElement.requestLayout?.() || mindmapElement.layout?.();
                }
              }
            } catch {
              // Silently handle layout errors
            }
          }, 200);

          // Set document title
          const title = `思维导图: ${material.name}`;

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

          // Clean up
          releaseEdgeless();

          // Open the mindmap in edit mode to trigger layout calculation
          // This ensures the mindmap is properly laid out before the user sees it
          setTimeout(() => {
            workbenchService.workbench.openDoc(mindmapDoc.id, {
              at: 'active',
            });
          }, 100);

          return mindmapDoc.id;
        } else {
          // Fallback: Add instruction note
          const surface = getSurfaceBlock(blockSuiteDoc);
          if (surface) {
            const noteId = blockSuiteDoc.addBlock(
              'affine:note',
              { xywh: '[100, 100, 400, 200]' },
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
                        '📝 思维导图创建失败\n\n请手动使用左侧工具栏的思维导图工具创建',
                    },
                  },
                  noteBlock.model.id
                );
              }
            }
          }

          releaseEdgeless();
          return null;
        }
      } catch {
        return null;
      }
    },
    [
      buildPromptFromMaterials,
      processAIMindmapResponse,
      cleanupTempDoc,
      collectionService,
      workbenchService,
      workspaceService,
      docsService,
      updateProgress,
    ]
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
        } else if (content.type === 'pdf' && content.content) {
          console.log(
            '[buildFlashcardsPrompt] Adding PDF attachment:',
            material.name
          );
          const blob = new Blob([content.content], { type: 'application/pdf' });
          attachments.push(blob);
          promptParts.push(`   [PDF Document ${attachments.length}]`);
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

  // Function to create notes from a single material
  const createNotes = useCallback(
    async (material: MaterialItem): Promise<string | null> => {
      let tempDoc: any = null;
      let releaseTempDoc: (() => void) | null = null;

      try {
        // Update progress
        updateProgress('preparing', 20, '正在准备材料...');

        // Build prompt and get attachments
        const { prompt, attachments } = await buildPromptFromMaterials([
          material,
        ]);

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
        updateProgress('generating', 40, 'AI 正在生成笔记内容...');
        const aiResponse = await AIProvider.actions.chat({
          input: prompt,
          workspaceId: workspaceService.workspace.id,
          docId: tempDoc.id,
          attachments: attachments.length > 0 ? attachments : undefined,
          stream: true,
        });

        // Process AI response
        updateProgress('processing', 70, '正在处理生成的内容...');
        const generatedContent = await processAIResponse(aiResponse);
        const title = extractTitle(generatedContent);

        // Create document from markdown
        updateProgress('finalizing', 85, '正在创建文档...');
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
      docsService,
      updateProgress,
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

  // Function to create flashcards from a single material
  const createFlashcards = useCallback(
    async (material: MaterialItem): Promise<string[] | null> => {
      let tempDoc: any = null;
      let releaseTempDoc: (() => void) | null = null;

      try {
        // Update progress
        updateProgress('preparing', 20, '正在准备闪卡材料...');

        // Build prompt and get attachments
        const { prompt, attachments } = await buildFlashcardsPrompt([material]);

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
        updateProgress('generating', 40, 'AI 正在生成闪卡内容...');
        const aiResponse = await AIProvider.actions.chat({
          input: prompt,
          workspaceId: workspaceService.workspace.id,
          docId: tempDoc.id,
          attachments: attachments.length > 0 ? attachments : undefined,
          stream: true,
        });

        // Process AI response
        updateProgress('processing', 70, '正在处理生成的闪卡...');
        const generatedContent = await processAIResponse(aiResponse);

        // Parse the JSON response and create individual flashcard documents
        updateProgress('finalizing', 85, '正在创建闪卡文档...');
        const docIds = await parseAndCreateFlashcards(generatedContent, [
          material,
        ]);

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
      docsService,
      updateProgress,
    ]
  );

  // Function to create podcast from materials
  // const createPodcast = useCallback(
  //   (_materialIds: string[], _materials: MaterialItem[]) => {
  //     // TODO: Implement podcast creation logic
  //     return Promise.resolve(null);
  //   },
  //   []
  // );

  const handleOptionToggle = useCallback((optionId: CreationOptionId) => {
    // Check if this option is disabled
    const option = creationOptions.find(opt => opt.id === optionId);
    if (option?.disabled) {
      toast('The podcast feature is under development. Stay tuned!');
      return;
    }

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

    // Capture the current active view and location before generation
    const originalActiveView = workbenchService.workbench.activeView$.value;
    const originalLocation = originalActiveView?.location$.value;

    // Calculate total items to process
    const totalItems = selectedMaterials.length * selectedOptions.size;

    // Set initial progress with total items
    setProgress(prev => ({
      ...prev,
      totalItems,
      currentItem: 0,
      currentItemName: '',
    }));

    // Process all combinations of materials and options
    const processOptions = async () => {
      let currentItemIndex = 0;
      const results = {
        mindmap: [] as string[],
        notes: [] as string[],
        flashcards: [] as string[][],
      };

      // Process each material
      for (const material of selectedMaterials) {
        // Process each selected option for this material
        for (const optionId of selectedOptions) {
          currentItemIndex++;

          // Update progress with overall info
          const optionName =
            optionId === 'mindmap'
              ? '思维导图'
              : optionId === 'notes'
                ? '笔记'
                : optionId === 'flashcards'
                  ? '闪卡'
                  : '播客';

          // Update the progress with total items info
          setProgress(prev => ({
            ...prev,
            totalItems,
            currentItem: currentItemIndex,
            currentItemName: `${material.name} - ${optionName}`,
          }));

          try {
            if (optionId === 'mindmap') {
              const docId = await createMindmap(material);
              if (docId) results.mindmap.push(docId);
            } else if (optionId === 'notes') {
              const docId = await createNotes(material);
              if (docId) results.notes.push(docId);
            } else if (optionId === 'flashcards') {
              const docIds = await createFlashcards(material);
              if (docIds) results.flashcards.push(docIds);
            }
          } catch (error) {
            console.error(
              `Failed to create ${optionId} for ${material.name}:`,
              error
            );
            // Continue with other items even if one fails
          }
        }
      }

      // Show summary toast
      const summaryParts = [];
      if (results.mindmap.length > 0) {
        summaryParts.push(`${results.mindmap.length} 个思维导图`);
      }
      if (results.notes.length > 0) {
        summaryParts.push(`${results.notes.length} 个笔记`);
      }
      if (results.flashcards.length > 0) {
        const totalFlashcards = results.flashcards.reduce(
          (sum, arr) => sum + arr.length,
          0
        );
        summaryParts.push(`${totalFlashcards} 张闪卡`);
      }

      if (summaryParts.length > 0) {
        toast(`成功创建: ${summaryParts.join(', ')}`);
      }

      // Return to the original page after all generation is complete
      // This ensures user returns to their original context (flashcards, notes, podcasts, etc.)
      if (originalActiveView && originalLocation) {
        setTimeout(() => {
          originalActiveView.replace(originalLocation);
        }, 500);
      }
    };

    // Set the generation function for retry
    setCurrentGenerationFn(() => processOptions);

    // Start generation with overlay
    await startGeneration(processOptions);
  }, [
    selectedMaterials,
    selectedOptions,
    createMindmap,
    createNotes,
    createFlashcards,
    startGeneration,
    setProgress,
    workbenchService,
  ]);

  return (
    <>
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
              className={`${styles.optionCard} ${
                selectedOptions.has(option.id) ? styles.optionCardSelected : ''
              } ${option.disabled ? styles.optionCardDisabled : ''}`}
              onClick={() => handleOptionToggle(option.id as CreationOptionId)}
            >
              <div className={styles.optionIcon}>{option.icon}</div>
              <div className={styles.optionName}>{option.name}</div>
              <div className={styles.optionDescription}>
                {option.disabled ? '功能开发中' : option.description}
              </div>
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

      {/* AI Generation Overlay */}
      <AIGenerationOverlay
        open={isGenerating || !!error}
        progress={progress}
        error={error}
        onCancel={cancel}
        onRetry={() => {
          if (currentGenerationFn) {
            retry(currentGenerationFn).catch(err => {
              console.error('Retry failed:', err);
            });
          }
        }}
      />
    </>
  );
};
