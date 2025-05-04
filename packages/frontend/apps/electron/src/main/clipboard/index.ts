import { clipboard, nativeImage } from 'electron';

import type { NamespaceHandlers } from '../type';

export const clipboardHandlers = {
  copyAsPNG: async (_, arrayBuffer: ArrayBuffer) => {
    const image = nativeImage.createFromBuffer(Buffer.from(arrayBuffer));
    if (image.isEmpty()) return false;
    clipboard.writeImage(image);
    return true;
  },
} satisfies NamespaceHandlers;
