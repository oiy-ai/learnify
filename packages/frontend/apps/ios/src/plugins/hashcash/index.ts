import { registerPlugin } from '@capacitor/core';

import type { HashcashPlugin } from './definitions';

const Hashcash = registerPlugin<HashcashPlugin>('Hashcash');

export * from './definitions';
export { Hashcash };
