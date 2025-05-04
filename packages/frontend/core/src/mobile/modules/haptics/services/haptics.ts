import { Service } from '@toeverything/infra';

import type { HapticProvider } from '../providers/haptic';

type ExtractArg<T extends keyof HapticProvider> = Parameters<
  HapticProvider[T]
>[0];

export class HapticsService extends Service {
  constructor(private readonly provider?: HapticProvider) {
    super();
  }

  impact(options?: ExtractArg<'impact'>) {
    this.provider?.impact?.(options)?.catch(console.error);
  }

  notification(options?: ExtractArg<'notification'>) {
    this.provider?.notification?.(options)?.catch(console.error);
  }

  vibrate(options?: ExtractArg<'vibrate'>) {
    this.provider?.vibrate?.(options)?.catch(console.error);
  }

  selectionStart() {
    this.provider?.selectionStart?.().catch(console.error);
  }

  selectionChanged() {
    this.provider?.selectionChanged?.().catch(console.error);
  }

  selectionEnd() {
    this.provider?.selectionEnd?.().catch(console.error);
  }
}
