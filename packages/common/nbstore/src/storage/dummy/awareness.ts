import { DummyConnection } from '../../connection';
import { type AwarenessRecord, AwarenessStorageBase } from '../awareness';

export class DummyAwarenessStorage extends AwarenessStorageBase {
  override update(_record: AwarenessRecord, _origin?: string): Promise<void> {
    return Promise.resolve();
  }
  override subscribeUpdate(
    _id: string,
    _onUpdate: (update: AwarenessRecord, origin?: string) => void,
    _onCollect: () => Promise<AwarenessRecord | null>
  ): () => void {
    return () => {};
  }
  override connection = new DummyConnection();
}
