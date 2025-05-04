import type { Framework } from '@toeverything/infra';

import { DesktopApiService } from '../desktop-api';
import { FindInPage } from './entities/find-in-page';
import { FindInPageService } from './services/find-in-page';

export { FindInPageService } from './services/find-in-page';

export function configureFindInPageModule(framework: Framework) {
  framework.service(FindInPageService).entity(FindInPage, [DesktopApiService]);
}
