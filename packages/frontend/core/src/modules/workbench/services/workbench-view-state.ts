import { createIdentifier, Service } from '@toeverything/infra';
import { nanoid } from 'nanoid';

import type { DesktopApiService, TabViewsMetaSchema } from '../../desktop-api';
import type { GlobalStateService } from '../../storage';
import type { ViewIconName } from '../constants';

export type WorkbenchDefaultState = {
  basename: string;
  views: {
    id: string;
    path?: { pathname?: string; hash?: string; search?: string };
    icon?: ViewIconName;
    title?: string;
  }[];
  activeViewIndex: number;
};

export const WorkbenchDefaultState = createIdentifier<WorkbenchDefaultState>(
  'WorkbenchDefaultState'
);

export const InMemoryWorkbenchDefaultState: WorkbenchDefaultState = {
  basename: '/',
  views: [
    {
      id: nanoid(),
    },
  ],
  activeViewIndex: 0,
};

export class DesktopWorkbenchDefaultState
  extends Service
  implements WorkbenchDefaultState
{
  constructor(
    private readonly globalStateService: GlobalStateService,
    private readonly electronApi: DesktopApiService
  ) {
    super();
  }

  get value() {
    const tabViewsMeta =
      this.globalStateService.globalState.get<TabViewsMetaSchema>(
        'tabViewsMetaSchema'
      );

    return (
      tabViewsMeta?.workbenches.find(
        w => w.id === this.electronApi.appInfo.viewId
      ) || InMemoryWorkbenchDefaultState
    );
  }

  get basename() {
    return this.value.basename;
  }

  get activeViewIndex() {
    return this.value.activeViewIndex;
  }

  get views() {
    return this.value.views;
  }
}
