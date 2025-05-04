import { useServiceOptional } from '@toeverything/infra';
import { useEffect } from 'react';

import { DesktopApiService } from '../../desktop-api';
import type { ViewIconName } from '../constants';
import { ViewService } from '../services/view';

export const ViewTitle = ({ title }: { title: string }) => {
  const view = useServiceOptional(ViewService)?.view;
  const desktopApi = useServiceOptional(DesktopApiService);

  useEffect(() => {
    if (view) {
      view.setTitle(title);
    } else if (desktopApi) {
      desktopApi.handler.ui
        .updateActiveViewMeta({
          title,
        })
        .catch(e => {
          console.error(e);
        });
    }
  }, [desktopApi, title, view]);

  return null;
};

export const ViewIcon = ({ icon }: { icon: ViewIconName }) => {
  const view = useServiceOptional(ViewService)?.view;
  const desktopApi = useServiceOptional(DesktopApiService);
  useEffect(() => {
    if (view) {
      view.setIcon(icon);
    } else if (desktopApi) {
      desktopApi.handler.ui
        .updateActiveViewMeta({
          iconName: icon,
        })
        .catch(e => {
          console.error(e);
        });
    }
  }, [desktopApi, icon, view]);

  return null;
};
