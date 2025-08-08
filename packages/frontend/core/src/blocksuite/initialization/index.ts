import type { DocCreateOptions } from '@affine/core/modules/doc/types';
import {
  type NoteProps,
  type ParagraphProps,
  type RootBlockProps,
} from '@blocksuite/affine/model';
import type { SurfaceBlockProps } from '@blocksuite/affine/std/gfx';
import { type Store, Text } from '@blocksuite/affine/store';

export interface DocProps {
  page?: Partial<RootBlockProps>;
  surface?: Partial<SurfaceBlockProps>;
  note?: Partial<NoteProps>;
  paragraph?: Partial<ParagraphProps>;
  onStoreLoad?: (
    doc: Store,
    props: {
      noteId: string;
      paragraphId: string;
      surfaceId: string;
    }
  ) => void;
}

export function initDocFromProps(
  doc: Store,
  props?: DocProps,
  options: DocCreateOptions = {}
) {
  doc.load(() => {
    const pageBlockId = doc.addBlock(
      'affine:page',
      props?.page || { title: new Text(options.title || '') }
    );
    const surfaceId = doc.addBlock(
      'affine:surface' as never,
      props?.surface || {},
      pageBlockId
    );

    props?.onStoreLoad?.(doc, {
      noteId: '',
      paragraphId: '',
      surfaceId,
    });
    doc.history.undoManager.clear();
  });
}
