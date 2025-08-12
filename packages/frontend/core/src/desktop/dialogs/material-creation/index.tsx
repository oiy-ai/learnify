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
import { useCallback, useMemo, useState } from 'react';

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
  } = useAIGeneration({
    onSuccess: () => {
      // Clear selection after successful generation
      setSelectedOptions(new Set());
    },
    onError: err => {
      console.error('AI generation failed:', err);
    },
  });

  // Define creation options with i18n
  const creationOptions = useMemo<
    Array<{
      id: CreationOptionId;
      name: string;
      icon: React.ReactNode;
      description: string;
      disabled?: boolean;
    }>
  >(
    () => [
      {
        id: 'mindmap',
        name: t['com.learnify.material-creation.mindmap'](),
        icon: <MindmapIcon />,
        description: t['com.learnify.material-creation.mindmap.description'](),
      },
      {
        id: 'notes',
        name: t['com.learnify.material-creation.notes'](),
        icon: <EdgelessIcon />,
        description: t['com.learnify.material-creation.notes.description'](),
      },
      {
        id: 'flashcards',
        name: t['com.learnify.material-creation.flashcards'](),
        icon: <FlashPanelIcon />,
        description:
          t['com.learnify.material-creation.flashcards.description'](),
      },
      {
        id: 'podcast',
        name: t['com.learnify.material-creation.podcast'](),
        icon: <PlayIcon />,
        description: t['com.learnify.material-creation.podcast.description'](),
        disabled: true,
      },
    ],
    [t]
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

      // Update progress to preprocessing stage
      updateProgress(
        'preprocessing',
        30,
        t['com.learnify.ai-generation.progress.preprocessing']()
      );

      // Step 1: Generate mindmap structure using AI
      let aiMindmapStructure;

      try {
        // Build prompt from single material
        const { prompt, attachments } = await buildPromptFromMaterials([
          material,
        ]);

        // Modify prompt for mindmap generation
        const mindmapPrompt = `${prompt}

Create a mind map structure that organizes the key concepts and relationships from the materials.

Requirements:
- Generate between 15-80 nodes total for optimal visualization
- Create a clear hierarchical structure with logical groupings
- Keep node text concise and meaningful

Return as JSON in this format:
{
  "text": "Central Topic",
  "children": [
    {
      "text": "Branch 1",
      "children": [
        {"text": "Sub-branch", "children": []}
      ]
    }
  ]
}

Return ONLY the JSON, no explanations or markdown.`;

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
        updateProgress(
          'generating',
          60,
          t['com.learnify.ai-generation.progress.generating-mindmap']()
        );
        const mindmapStructure = await processAIMindmapResponse(aiResponse);

        if (mindmapStructure) {
          aiMindmapStructure = mindmapStructure;
        }
      } catch (aiError) {
        console.error('Failed to generate mindmap with AI:', aiError);
        // Re-throw to let the parent handle the error
        throw aiError;
      } finally {
        // Clean up temp doc
        cleanupTempDoc(tempDoc, releaseTempDoc);
      }

      // If AI failed, we should have thrown above
      if (!aiMindmapStructure) {
        throw new Error('Failed to generate mindmap structure');
      }

      // Step 2: Create edgeless document
      updateProgress(
        'finalizing',
        80,
        t['com.learnify.ai-generation.progress.creating-mindmap']()
      );
      const title = t.t('com.learnify.material-creation.title.mindmap', {
        name: material.name,
      });
      const mindmapDoc = docsService.createDoc({
        primaryMode: 'edgeless',
        title: title, // Set title during creation
      });
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

        // Title is already set during doc creation
        // Just ensure it's also in meta for workspace display
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
        // Clean up and throw error if mindmap creation failed
        releaseEdgeless();

        // Remove the empty doc since we couldn't create the mindmap
        workspaceService.workspace.docCollection.removeDoc(mindmapDoc.id);

        throw new Error('Failed to create mindmap element');
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
      t,
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
        updateProgress(
          'preparing',
          20,
          t['com.learnify.ai-generation.progress.preparing']()
        );

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
        updateProgress(
          'preprocessing',
          40,
          t['com.learnify.ai-generation.progress.preprocessing']()
        );
        const aiResponse = await AIProvider.actions.chat({
          input: prompt,
          workspaceId: workspaceService.workspace.id,
          docId: tempDoc.id,
          attachments: attachments.length > 0 ? attachments : undefined,
          stream: true,
        });

        // Process AI response
        updateProgress(
          'generating',
          70,
          t['com.learnify.ai-generation.progress.generating-notes']()
        );
        const generatedContent = await processAIResponse(aiResponse);
        const title = extractTitle(generatedContent);

        // Create document from markdown
        updateProgress(
          'finalizing',
          85,
          t['com.learnify.ai-generation.progress.creating-notes']()
        );
        const docId = await MarkdownTransformer.importMarkdownToDoc({
          collection: workspaceService.workspace.docCollection,
          schema: getAFFiNEWorkspaceSchema(),
          markdown: generatedContent,
          fileName: title,
          extensions: getStoreManager().config.init().value.get('store'),
        });

        if (docId) {
          // Set title in the document itself
          const { doc: notesDoc, release } = docsService.open(docId);
          await notesDoc.waitForSyncReady();
          const blockSuiteDoc = notesDoc.blockSuiteDoc;
          const pageBlock = blockSuiteDoc.root as any;
          if (pageBlock && pageBlock.title) {
            blockSuiteDoc.transact(() => {
              // Title is already set by MarkdownTransformer, but ensure it's correct
              if (pageBlock.title.length === 0) {
                pageBlock.title.insert(title, 0);
              }
            });
          }
          release();

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
      t,
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
        updateProgress(
          'preparing',
          20,
          t['com.learnify.ai-generation.progress.preparing']()
        );

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
        updateProgress(
          'preprocessing',
          40,
          t['com.learnify.ai-generation.progress.preprocessing']()
        );
        const aiResponse = await AIProvider.actions.chat({
          input: prompt,
          workspaceId: workspaceService.workspace.id,
          docId: tempDoc.id,
          attachments: attachments.length > 0 ? attachments : undefined,
          stream: true,
        });

        // Process AI response
        updateProgress(
          'generating',
          70,
          t['com.learnify.ai-generation.progress.generating-flashcards']()
        );
        const generatedContent = await processAIResponse(aiResponse);

        // Parse the JSON response and create individual flashcard documents
        updateProgress(
          'finalizing',
          85,
          t['com.learnify.ai-generation.progress.creating-flashcards']()
        );
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
      t,
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

  const handleOptionToggle = useCallback(
    (optionId: CreationOptionId) => {
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
    },
    [creationOptions]
  );

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
      const errors: Array<{ material: string; option: string; error: Error }> =
        [];

      // Process each material
      for (const material of selectedMaterials) {
        // Process each selected option for this material
        for (const optionId of selectedOptions) {
          currentItemIndex++;

          // Update progress with overall info
          const optionName =
            optionId === 'mindmap'
              ? t['com.learnify.material-creation.type.mindmap']()
              : optionId === 'notes'
                ? t['com.learnify.material-creation.type.note']()
                : optionId === 'flashcards'
                  ? t['com.learnify.material-creation.type.flashcard']()
                  : t['com.learnify.material-creation.type.podcast']();

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
            // Track the error but continue with other items
            errors.push({
              material: material.name,
              option: optionName,
              error: error instanceof Error ? error : new Error(String(error)),
            });
          }
        }
      }

      // If there were errors, throw an aggregated error
      if (errors.length > 0) {
        // Check if any error is a Payment Required error
        const hasPaymentError = errors.some(
          e =>
            e.error.message.toLowerCase().includes('payment required') ||
            e.error.name === 'PaymentRequiredError'
        );

        // If it's a payment error, show special message
        if (hasPaymentError) {
          throw new Error(
            "You've reached the current usage cap for Learnify AI. Stay tuned for the future updates about the paid plan!"
          );
        }

        // Otherwise, show detailed error summary
        // Create a summary of what succeeded
        const successSummary = [];
        if (results.mindmap.length > 0) {
          successSummary.push(
            t.t('com.learnify.material-creation.success-mindmaps', {
              count: results.mindmap.length,
            })
          );
        }
        if (results.notes.length > 0) {
          successSummary.push(
            t.t('com.learnify.material-creation.success-notes', {
              count: results.notes.length,
            })
          );
        }
        if (results.flashcards.length > 0) {
          const totalFlashcards = results.flashcards.reduce(
            (sum, arr) => sum + arr.length,
            0
          );
          successSummary.push(
            t.t('com.learnify.material-creation.success-flashcards', {
              count: totalFlashcards,
            })
          );
        }

        // Create error message
        const errorMessages = errors.map(
          e => `${e.material} (${e.option}): ${e.error.message}`
        );

        let message =
          t['com.learnify.material-creation.partial-failure']?.() ||
          'Some items failed to generate:\n';
        message += errorMessages.join('\n');

        if (successSummary.length > 0) {
          message +=
            '\n\n' +
            (t['com.learnify.material-creation.partial-success']?.() ||
              'Successfully created: ') +
            successSummary.join(', ');
        }

        // Throw error to trigger error state in overlay
        throw new Error(message);
      }

      // All successful - show summary toast
      const summaryParts = [];
      if (results.mindmap.length > 0) {
        summaryParts.push(
          t.t('com.learnify.material-creation.success-mindmaps', {
            count: results.mindmap.length,
          })
        );
      }
      if (results.notes.length > 0) {
        summaryParts.push(
          t.t('com.learnify.material-creation.success-notes', {
            count: results.notes.length,
          })
        );
      }
      if (results.flashcards.length > 0) {
        const totalFlashcards = results.flashcards.reduce(
          (sum, arr) => sum + arr.length,
          0
        );
        summaryParts.push(
          t.t('com.learnify.material-creation.success-flashcards', {
            count: totalFlashcards,
          })
        );
      }

      if (summaryParts.length > 0) {
        toast(
          t.t('com.learnify.material-creation.success-message', {
            items: summaryParts.join(', '),
          })
        );
      }

      // Close the dialog after successful completion
      // Note: Dialog won't close if there's an error (handled by error state)
      close();

      // Return to the original page after all generation is complete
      // This ensures user returns to their original context (flashcards, notes, podcasts, etc.)
      if (originalActiveView && originalLocation) {
        setTimeout(() => {
          originalActiveView.replace(originalLocation);
        }, 500);
      }
    };

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
    close,
    t,
  ]);

  return (
    <>
      <Modal
        open
        onOpenChange={() => {
          // Don't allow closing during generation or when there's an error
          if (!isGenerating && !error) {
            close();
          }
        }}
        width={520}
        contentOptions={{
          style: { padding: 0 },
        }}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {t['com.learnify.material-creation.create-from-materials']()}
          </h2>
          <p className={styles.modalDescription}>
            {t['com.learnify.material-creation.dialog.description']?.() ||
              'Choose how you want to process the selected materials'}
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
                {option.disabled
                  ? t['com.learnify.material-creation.podcast.disabled']()
                  : option.description}
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
        onCancel={() => {
          // Cancel button: only close the overlay, keep dialog open
          cancel();
        }}
        onConfirm={() => {
          // Confirm button: close both overlay and dialog
          cancel();
          close();
        }}
      />
    </>
  );
};
