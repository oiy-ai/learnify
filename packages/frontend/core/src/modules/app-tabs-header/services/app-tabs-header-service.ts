import { LiveData, Service } from '@toeverything/infra';
import { Observable } from 'rxjs';

import type { ClientEvents, DesktopApiService } from '../../desktop-api';

export type TabStatus = Parameters<
  Parameters<NonNullable<ClientEvents>['ui']['onTabsStatusChange']>[0]
>[0][number];

export class AppTabsHeaderService extends Service {
  constructor(private readonly desktopApi: DesktopApiService) {
    super();
  }

  tabsStatus$ = LiveData.from<TabStatus[]>(
    new Observable(subscriber => {
      let unsub: (() => void) | undefined;
      this.desktopApi.handler.ui
        .getTabsStatus()
        .then(tabs => {
          subscriber.next(tabs);
          unsub = this.desktopApi.events.ui.onTabsStatusChange(tabs => {
            subscriber.next(tabs);
          });
        })
        .catch(console.error);

      return () => {
        unsub?.();
      };
    }),
    []
  );

  showContextMenu = this.desktopApi.handler.ui.showTabContextMenu;

  activateView = this.desktopApi.handler.ui.activateView;

  closeTab = this.desktopApi.handler.ui.closeTab;

  onAddTab = this.desktopApi.handler.ui.addTab;

  onAddDocTab = async (
    docId: string,
    targetTabId?: string,
    edge?: 'left' | 'right'
  ) => {
    await this.desktopApi.handler.ui.addTab({
      view: {
        path: {
          pathname: '/' + docId,
        },
      },
      target: targetTabId,
      edge,
    });
  };

  onAddTagTab = async (
    tagId: string,
    targetTabId?: string,
    edge?: 'left' | 'right'
  ) => {
    await this.desktopApi.handler.ui.addTab({
      view: {
        path: {
          pathname: '/tag/' + tagId,
        },
      },
      target: targetTabId,
      edge,
    });
  };

  onAddCollectionTab = async (
    collectionId: string,
    targetTabId?: string,
    edge?: 'left' | 'right'
  ) => {
    await this.desktopApi.handler.ui.addTab({
      view: {
        path: {
          pathname: '/collection/' + collectionId,
        },
      },
      target: targetTabId,
      edge,
    });
  };

  onToggleRightSidebar = this.desktopApi.handler.ui.toggleRightSidebar;

  moveTab = this.desktopApi.handler.ui.moveTab;
}
