import { Scope } from '@toeverything/infra';

import type { Server } from '../entities/server';

export class ServerScope extends Scope<{ server: Server }> {
  readonly server = this.props.server;
}
