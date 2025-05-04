import type { Store } from '@blocksuite/affine/store';
import { Scope } from '@toeverything/infra';

import type { DocRecord } from '../entities/record';

export class DocScope extends Scope<{
  docId: string;
  record: DocRecord;
  blockSuiteDoc: Store;
}> {}
