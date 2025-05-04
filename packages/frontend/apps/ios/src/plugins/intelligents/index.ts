import { registerPlugin } from '@capacitor/core';

import type { IntelligentsPlugin } from './definitions';

const Intelligents = registerPlugin<IntelligentsPlugin>('Intelligents');

export * from './definitions';
export { Intelligents };
