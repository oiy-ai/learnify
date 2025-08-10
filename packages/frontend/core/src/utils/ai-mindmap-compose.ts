/**
 * Example of how to use mindmap creator in AI compose context
 * This can be integrated into the AI compose tool
 */

import type { DocsService } from '@affine/core/modules/doc';

import { createMindmapFromAI } from './mindmap-creator';

/**
 * Creates a mindmap document from AI-generated content
 * This function can be called by the AI compose tool
 *
 * @param docsService The docs service instance
 * @param aiResponse The AI-generated mindmap structure (JSON string or object)
 * @returns The document ID of the created mindmap
 */
export async function composeAIMindmap(
  docsService: DocsService,
  aiResponse: string | any
): Promise<string | null> {
  try {
    // Step 1: Create a new edgeless document
    const doc = docsService.createDoc({
      primaryMode: 'edgeless',
    });

    // Step 2: Open the document to get the blockSuite doc
    const { doc: edgelessDoc, release } = docsService.open(doc.id);

    // Step 3: Wait for the document to be ready
    await edgelessDoc.waitForSyncReady();
    const blockSuiteDoc = edgelessDoc.blockSuiteDoc;

    // Step 4: Create the mindmap from AI content
    const mindmapId = await createMindmapFromAI(blockSuiteDoc, aiResponse);

    if (mindmapId) {
      // Step 5: Set document title
      const title = extractTitleFromAIResponse(aiResponse);
      const docsStore = (docsService as any).docsStore;
      if (docsStore && docsStore.setDocMeta) {
        docsStore.setDocMeta(doc.id, { title });
      }
    }

    // Step 6: Clean up
    release();

    return mindmapId ? doc.id : null;
  } catch {
    return null;
  }
}

/**
 * Extracts title from AI response
 */
function extractTitleFromAIResponse(aiResponse: string | any): string {
  if (typeof aiResponse === 'string') {
    try {
      const parsed = JSON.parse(aiResponse);
      return parsed.text || parsed.title || 'AI Mindmap';
    } catch {
      const lines = aiResponse.split('\n');
      return lines[0] || 'AI Mindmap';
    }
  } else if (aiResponse && typeof aiResponse === 'object') {
    return aiResponse.text || aiResponse.title || 'AI Mindmap';
  }
  return 'AI Mindmap';
}

/**
 * Example AI response format that the AI should generate
 */
export const MINDMAP_AI_PROMPT = `
Generate a mindmap structure in the following JSON format:
{
  "text": "Main Topic",
  "children": [
    {
      "text": "Subtopic 1",
      "children": [
        { "text": "Detail 1.1", "children": [] },
        { "text": "Detail 1.2", "children": [] }
      ]
    },
    {
      "text": "Subtopic 2",
      "children": [
        { "text": "Detail 2.1", "children": [] }
      ]
    }
  ]
}
`;

/**
 * Integrates with AI provider to generate and create mindmap
 */
export async function generateAndCreateMindmap(
  docsService: DocsService,
  userPrompt: string,
  aiProvider: any // Replace with actual AI provider type
): Promise<string | null> {
  try {
    // Step 1: Call AI to generate mindmap structure
    const aiResponse = await aiProvider.generateMindmap({
      prompt: userPrompt + '\n\n' + MINDMAP_AI_PROMPT,
      format: 'json',
    });

    // Step 2: Create mindmap document with AI response
    return await composeAIMindmap(docsService, aiResponse);
  } catch {
    return null;
  }
}
