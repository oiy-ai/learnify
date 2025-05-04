import type { Connection } from '../connection';
import { type Storage } from './storage';

export type AwarenessRecord = {
  docId: string;
  bin: Uint8Array;
};

export interface AwarenessStorage extends Storage {
  readonly storageType: 'awareness';

  /**
   * Update the awareness record.
   *
   * @param origin - Internal identifier to recognize the source in the "update" event. Will not be stored or transferred.
   */
  update(record: AwarenessRecord, origin?: string): Promise<void>;
  subscribeUpdate(
    id: string,
    onUpdate: (update: AwarenessRecord, origin?: string) => void,
    onCollect: () => Promise<AwarenessRecord | null>
  ): () => void;
}

export abstract class AwarenessStorageBase implements AwarenessStorage {
  readonly storageType = 'awareness';
  abstract readonly connection: Connection;

  abstract update(record: AwarenessRecord, origin?: string): Promise<void>;

  abstract subscribeUpdate(
    id: string,
    onUpdate: (update: AwarenessRecord, origin?: string) => void,
    onCollect: () => Promise<AwarenessRecord | null>
  ): () => void;
}
