import { type Framework } from '@toeverything/infra';

import { DesktopApiService } from '../desktop-api';
import { AppTabsHeaderService } from './services/app-tabs-header-service';

export { AppTabsHeader } from './views/app-tabs-header';

export function configureAppTabsHeaderModule(framework: Framework) {
  framework.service(AppTabsHeaderService, [DesktopApiService]);
}
