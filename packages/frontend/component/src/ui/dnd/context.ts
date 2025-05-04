import { createContext } from 'react';

import type { DNDData, fromExternalData, toExternalData } from './types';

export const DNDContext = createContext<{
  /**
   * external data adapter.
   * Convert the external data to the draggable data that are known to affine.
   *
   * if this is provided, the drop target will handle external elements as well.
   *
   * @default undefined
   */
  fromExternalData?: fromExternalData<DNDData>;

  /**
   * Convert the draggable data to the external data.
   * Mainly used to be consumed by blocksuite.
   *
   * @default undefined
   */
  toExternalData?: toExternalData<DNDData>;
}>({});
