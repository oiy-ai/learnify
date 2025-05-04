import type { Framework } from '@toeverything/infra';

import { NavigationGestureProvider } from './providers/navigation-gesture';
import { NavigationGestureService } from './services/navigation-gesture';

export { NavigationGestureProvider, NavigationGestureService };

export function configureMobileNavigationGestureModule(framework: Framework) {
  framework.service(
    NavigationGestureService,
    f => new NavigationGestureService(f.getOptional(NavigationGestureProvider))
  );
}
