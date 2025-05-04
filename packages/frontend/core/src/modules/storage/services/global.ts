import { Service } from '@toeverything/infra';

import type {
  GlobalCache,
  GlobalSessionState,
  GlobalState,
} from '../providers/global';

export class GlobalStateService extends Service {
  constructor(public readonly globalState: GlobalState) {
    super();
  }
}

export class GlobalCacheService extends Service {
  constructor(public readonly globalCache: GlobalCache) {
    super();
  }
}

export class GlobalSessionStateService extends Service {
  constructor(public readonly globalSessionState: GlobalSessionState) {
    super();
  }
}
