import type { Framework } from '@toeverything/infra';

import { configureMobileHapticsModule } from './haptics';
import { configureMobileNavigationGestureModule } from './navigation-gesture';
import { configureMobileSearchModule } from './search';
import { configureMobileVirtualKeyboardModule } from './virtual-keyboard';

export function configureMobileModules(framework: Framework) {
  configureMobileSearchModule(framework);
  configureMobileVirtualKeyboardModule(framework);
  configureMobileNavigationGestureModule(framework);
  configureMobileHapticsModule(framework);
}
