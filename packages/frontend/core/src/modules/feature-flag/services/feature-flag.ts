import { OnEvent, Service } from '@toeverything/infra';
import { distinctUntilChanged, skip } from 'rxjs';

import { ApplicationStarted } from '../../lifecycle';
import { Flags, type FlagsExt } from '../entities/flags';

@OnEvent(ApplicationStarted, e => e.setupRestartListener)
export class FeatureFlagService extends Service {
  flags = this.framework.createEntity(Flags) as FlagsExt;

  setupRestartListener() {
    this.flags.enable_ai.$.pipe(distinctUntilChanged(), skip(1)).subscribe(
      () => {
        // when enable_ai flag changes, reload the page.
        window.location.reload();
      }
    );
  }
}
