import { createIdentifier } from '@toeverything/infra';

export interface HapticProvider {
  impact: (options?: { style?: 'HEAVY' | 'LIGHT' | 'MEDIUM' }) => Promise<void>;
  notification: (options?: {
    type?: 'SUCCESS' | 'ERROR' | 'WARNING';
  }) => Promise<void>;
  vibrate: (options?: { duration?: number }) => Promise<void>;
  selectionStart: () => Promise<void>;
  selectionChanged: () => Promise<void>;
  selectionEnd: () => Promise<void>;
}

export const HapticProvider =
  createIdentifier<HapticProvider>('HapticProvider');
