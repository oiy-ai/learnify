import { Service } from '@toeverything/infra';

import { GlobalState } from '../../storage';
import { AppSidebar } from '../entities/app-sidebar';

export class AppSidebarService extends Service {
  sidebar = this.framework.createEntity(AppSidebar, [GlobalState]);
}
