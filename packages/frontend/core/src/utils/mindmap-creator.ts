import { getSurfaceBlock } from '@blocksuite/affine/blocks/surface';
import type { Store } from '@blocksuite/affine/store';

export interface MindmapNode {
  text: string;
  children?: MindmapNode[];
}

export interface CreateMindmapOptions {
  /**
   * The root node and structure of the mindmap
   */
  tree: MindmapNode;
  /**
   * Style of the mindmap (1-4)
   */
  style?: number;
  /**
   * Layout type: 0=right, 1=left, 2=balance
   */
  layoutType?: number;
  /**
   * Position and size [x, y, width, height]
   */
  xywh?: string;
}

/**
 * Creates a mindmap in a BlockSuite edgeless document
 * This can be used both in UI context and backend/AI compose context
 *
 * @param blockSuiteDoc The BlockSuite document store
 * @param options Mindmap creation options
 * @returns The ID of the created mindmap element, or null if failed
 */
export async function createMindmap(
  blockSuiteDoc: Store,
  options: CreateMindmapOptions
): Promise<string | null> {
  try {
    // Wait for document to be ready if needed
    if (!blockSuiteDoc.root) {
      return null;
    }

    // Get surface block
    const surface = getSurfaceBlock(blockSuiteDoc);
    if (!surface) {
      return null;
    }

    const surfaceModel = surface;

    // Check if surface already has a mindmap
    const elements = surfaceModel.elements;
    if (elements) {
      let hasMindmap = false;
      // Access the underlying ymap if it's a Boxed type
      const ymap = (elements as any).ymap || elements;
      if (ymap && typeof ymap.forEach === 'function') {
        ymap.forEach((element: any) => {
          if (element.type === 'mindmap') {
            hasMindmap = true;
          }
        });
      }

      if (hasMindmap) {
        return null;
      }
    }

    // Create mindmap in a transaction
    let mindmapId: string | null = null;

    blockSuiteDoc.transact(() => {
      try {
        // Try format 1: type as property
        mindmapId = (surfaceModel.addElement as any)({
          type: 'mindmap',
          children: options.tree,
          style: options.style || 1,
          layoutType: options.layoutType || 0,
          xywh: options.xywh || '[0, 0, 800, 600]',
        });
      } catch {
        // Try format 2: type as first parameter
        try {
          mindmapId = (surfaceModel.addElement as any)('mindmap', {
            children: options.tree,
            style: options.style || 1,
            layoutType: options.layoutType || 0,
            xywh: options.xywh || '[0, 0, 800, 600]',
          });
        } catch {
          // Try both formats, fail silently
        }
      }
    });

    // Trigger layout calculation for the mindmap
    if (mindmapId) {
      // Wait a bit for the element to be fully created
      setTimeout(() => {
        try {
          if (mindmapId) {
            const mindmapElement = surfaceModel.getElementById?.(
              mindmapId
            ) as any;
            if (mindmapElement) {
              // Call buildTree and requestLayout if available
              mindmapElement.buildTree?.();
              mindmapElement.requestLayout?.() || mindmapElement.layout?.();

              // Also try to trigger a surface update
              (surfaceModel as any).refresh?.();
            }
          }
        } catch {
          // Silently handle layout errors
        }
      }, 100);
    }

    return mindmapId;
  } catch {
    return null;
  }
}

/**
 * Creates a default mindmap structure for learning materials
 */
export function createDefaultMindmapTree(
  rootText: string = '知识图谱',
  branches: string[] = ['概念1', '概念2', '概念3']
): MindmapNode {
  return {
    text: rootText,
    children: branches.map(branch => ({
      text: branch,
      children: [],
    })),
  };
}

/**
 * Creates a mindmap from AI-generated content
 * This is specifically designed for the AI compose tool
 */
export async function createMindmapFromAI(
  blockSuiteDoc: Store,
  aiContent: string | MindmapNode
): Promise<string | null> {
  let tree: MindmapNode;

  if (typeof aiContent === 'string') {
    // Parse AI response if it's a string (JSON or structured text)
    try {
      tree = JSON.parse(aiContent);
    } catch {
      // If not JSON, create a simple structure from the text
      const lines = aiContent.split('\n').filter(line => line.trim());
      tree = {
        text: lines[0] || 'AI Generated Mindmap',
        children: lines.slice(1, 4).map(line => ({
          text: line,
          children: [],
        })),
      };
    }
  } else {
    tree = aiContent;
  }

  return createMindmap(blockSuiteDoc, {
    tree,
    style: 1,
    layoutType: 0,
    xywh: '[0, 0, 1000, 800]',
  });
}
