import type * as Effect from '@blocksuite/affine/effects';
import type * as ConnectorEffect from '@blocksuite/affine/gfx/connector';
import type * as ShapeEffect from '@blocksuite/affine/gfx/shape';
import type { EditorHost } from '@blocksuite/affine/std';
import type { Store, Transformer, Workspace } from '@blocksuite/affine/store';
import type { TestAffineEditorContainer } from '@blocksuite/integration-test';

declare type _GLOBAL_ =
  | typeof Effect
  | typeof ConnectorEffect
  | typeof ShapeEffect;

declare global {
  interface Window {
    /** Available on playground window
     * the following instance are initialized in `packages/playground/apps/starter/main.ts`
     */
    $blocksuite: {
      store: typeof import('@blocksuite/affine/store');
      blocks: {
        database: typeof import('@blocksuite/affine/blocks/database');
        note: typeof import('@blocksuite/affine/blocks/note');
      };
      global: {
        utils: typeof import('@blocksuite/affine/global/utils');
      };
      services: typeof import('@blocksuite/affine/shared/services');
      editor: typeof import('@blocksuite/integration-test');
      blockStd: typeof import('@blocksuite/affine/std');
      affineModel: typeof import('@blocksuite/affine-model');
    };
    collection: Workspace;
    doc: Store;
    editor: TestAffineEditorContainer;
    host: EditorHost;
    job: Transformer;
  }
}
