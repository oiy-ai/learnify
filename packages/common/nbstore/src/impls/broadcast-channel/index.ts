import type { StorageConstructor } from '..';
import { BroadcastChannelAwarenessStorage } from './awareness';

export const broadcastChannelStorages = [
  BroadcastChannelAwarenessStorage,
] satisfies StorageConstructor[];
