import { createEvent } from '@toeverything/infra';

import type { Doc } from '../entities/doc';
import type { DocRecord } from '../entities/record';

export const DocCreated = createEvent<DocRecord>('DocCreated');

export const DocInitialized = createEvent<Doc>('DocInitialized');
