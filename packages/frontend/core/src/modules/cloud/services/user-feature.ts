import { OnEvent, Service } from '@toeverything/infra';

import { UserFeature } from '../entities/user-feature';
import { AccountChanged } from '../events/account-changed';

@OnEvent(AccountChanged, e => e.onAccountChanged)
export class UserFeatureService extends Service {
  userFeature = this.framework.createEntity(UserFeature);

  private onAccountChanged() {
    this.userFeature.revalidate();
  }
}
