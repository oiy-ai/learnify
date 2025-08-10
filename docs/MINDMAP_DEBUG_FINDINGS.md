# Mindmap Debug Findings

## Executive Summary

Successfully implemented automatic mindmap creation in Learnify, both for UI-based editor context and backend AI compose tools. Mindmaps can now be created programmatically with proper layout rendering.

## Key Discoveries

### 1. Document Loading Lifecycle

- Documents are NOT fully loaded when `DocsService.open()` is called
- `blockSuiteDoc.load()` only triggers loading, content loads asynchronously
- Surface blocks are available ONLY after editor container is bound
- The correct time to access document structure is in `Editor.bindEditorContainer()`
- For backend creation, must wait for `doc.waitForSyncReady()`

### 2. Document Structure

- **Page mode documents**: Have note blocks and paragraph blocks
- **Edgeless mode documents**: Should only have surface blocks (no note blocks by default)
- Surface blocks contain a Yjs Map called `elements` where mindmaps are stored
- Elements container can be accessed via `model.elements`, `model._elements`, or `model.yElements`

### 3. Mindmap Storage

- Mindmaps are NOT blocks, they are elements within the surface block
- Stored in `surfaceBlock.model.elements` as a Yjs Map
- Each mindmap has:
  - `type: 'mindmap'`
  - `style: number` (1-4 for different visual styles)
  - `layoutType: number` (0=right, 1=left, 2=balance)
  - `children: object` (nested structure with text and child nodes)
  - `xywh: string` (position and size, e.g., '[0, 0, 800, 600]')
  - `id: string` (unique identifier)
  - `seed: number` (for random generation)
  - `index: string` (z-index like 'a0')

### 4. Mindmap Rendering

- Mindmaps are rendered on canvas, not as HTML elements
- Uses BlockSuite's GFX (Graphics Framework) system
- Cannot be selected when not in edit mode
- Requires layout calculation after creation to avoid overlapping nodes

### 5. Creating Mindmaps

#### Required Steps:

1. **Use transaction**: Must wrap creation in `doc.transact()` to avoid readonly mode errors
2. **Correct API call**: Use `surfaceModel.addElement({ type: 'mindmap', ... })` with type as property
3. **Trigger layout**: Call `mindmapElement.buildTree()` and `mindmapElement.requestLayout()` after creation

#### Common Errors:

- `Cannot add element in readonly mode` - Not using transaction
- `Invalid element type: undefined` - Wrong parameter format
- Elements overlapping - Not triggering layout after creation

### 6. CRUD Service Access

- EdgelessCRUDIdentifier service is not directly accessible in many contexts
- Surface model's `addElement` method is the reliable way to create mindmaps
- Service identifiers must be properly formatted (parsing errors are common)

## Timeline of Document Loading

1. `DocsService.createDoc()` - Creates document record
2. `initDocFromProps()` - Initializes basic structure (too early for mindmaps)
3. `DocsService.open()` - Opens document (blocks not loaded yet)
4. `DocInitialized` event - Emitted but content still not ready
5. `Editor.bindEditorContainer()` - Editor binds, content becomes available (~1s delay)
6. Surface blocks and elements are now accessible
7. Layout must be triggered after element creation (~100-500ms delay)

## Implementation Solutions

### 1. UI Context (Editor)

```typescript
// In editor.ts bindEditorContainer
blockSuiteDoc.transact(() => {
  const mindmapId = surfaceModel.addElement({
    type: 'mindmap',
    children: treeStructure,
    style: 1,
    layoutType: 0,
    xywh: '[0, 0, 800, 600]',
  });
});

// Trigger layout after creation
setTimeout(() => {
  const element = surfaceModel.getElementById(mindmapId);
  element?.buildTree();
  element?.requestLayout();
}, 500);
```

### 2. Backend Context (AI Compose)

```typescript
// Create document
const doc = docsService.createDoc({ primaryMode: 'edgeless' });
const { doc: edgelessDoc, release } = docsService.open(doc.id);

// Wait for sync
await edgelessDoc.waitForSyncReady();
const blockSuiteDoc = edgelessDoc.blockSuiteDoc;

// Get surface and create mindmap
const surface = getSurfaceBlock(blockSuiteDoc);
blockSuiteDoc.transact(() => {
  surface.model.addElement({
    type: 'mindmap',
    children: aiGeneratedTree,
    style: 1,
    layoutType: 0,
    xywh: '[0, 0, 1200, 900]',
  });
});
```

### 3. Utility Functions Created

- `/utils/mindmap-creator.ts` - Core mindmap creation utilities
- `/utils/ai-mindmap-compose.ts` - AI integration helpers
- Both handle layout triggering automatically

## Best Practices

1. **Always use transactions** when modifying document structure
2. **Wait for document ready state** before accessing blocks
3. **Trigger layout after creation** to ensure proper rendering
4. **Use proper element type format** (type as property, not parameter)
5. **Handle multiple element access patterns** (elements/\_elements/yElements)
6. **Add delays for layout calculation** (100-500ms typically sufficient)

## Layout Fix

The key to preventing overlapping mindmap nodes is calling these methods after creation:

1. `buildTree()` - Constructs the tree data structure
2. `requestLayout()` or `layout()` - Calculates node positions

This must be done after a small delay (100-500ms) to ensure the element is fully initialized.

## Testing Checklist

- [x] Create mindmap in edgeless document
- [x] Auto-create default mindmap when opening empty edgeless doc
- [x] Create mindmap from materials (AI compose)
- [x] Proper layout without manual intervention
- [x] Integration with collections (Mind Maps collection)
- [x] Navigation to newly created mindmap

## Future Improvements

1. Replace mock AI responses with actual AI service calls
2. Add more mindmap styles and layout options
3. Implement mindmap templates
4. Add real-time collaborative editing support
5. Optimize layout calculation timing
