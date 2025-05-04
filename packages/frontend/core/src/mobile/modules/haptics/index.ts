import type { Framework } from '@toeverything/infra';

import { HapticProvider } from './providers/haptic';
import { HapticsService } from './services/haptics';

export function configureMobileHapticsModule(framework: Framework) {
  framework.service(
    HapticsService,
    f => new HapticsService(f.getOptional(HapticProvider))
  );
}

export { HapticProvider, HapticsService };
