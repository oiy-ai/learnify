import type { Framework } from '@toeverything/infra';

import { ClientSchemeProvider } from './providers/client-schema';
import { PopupWindowProvider } from './providers/popup-window';
import { UrlService } from './services/url';

export { ClientSchemeProvider } from './providers/client-schema';
export { PopupWindowProvider } from './providers/popup-window';
export { UrlService } from './services/url';

export const configureUrlModule = (container: Framework) => {
  container.service(
    UrlService,
    f =>
      new UrlService(
        f.getOptional(PopupWindowProvider),
        f.getOptional(ClientSchemeProvider)
      )
  );
};
