import { type Framework } from '@toeverything/infra';

import { DesktopApi } from './entities/electron-api';
import { ElectronApiImpl } from './impl';
import { DesktopApiProvider } from './provider';
import { DesktopApiService } from './service/desktop-api';

export function configureDesktopApiModule(framework: Framework) {
  framework
    .impl(DesktopApiProvider, ElectronApiImpl)
    .entity(DesktopApi, [DesktopApiProvider])
    .service(DesktopApiService, [DesktopApi]);
}

export { DesktopApiService } from './service/desktop-api';
export type { ClientEvents, TabViewsMetaSchema } from '@affine/electron-api';
