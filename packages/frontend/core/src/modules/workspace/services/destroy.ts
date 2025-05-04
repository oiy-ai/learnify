import { Service } from '@toeverything/infra';

import type { WorkspaceMetadata } from '../metadata';
import type { WorkspaceFlavoursService } from './flavours';

export class WorkspaceDestroyService extends Service {
  constructor(private readonly flavoursService: WorkspaceFlavoursService) {
    super();
  }

  deleteWorkspace = async (metadata: WorkspaceMetadata) => {
    const provider = this.flavoursService.flavours$.value.find(
      p => p.flavour === metadata.flavour
    );
    if (!provider) {
      throw new Error(`Unknown workspace flavour: ${metadata.flavour}`);
    }
    return provider.deleteWorkspace(metadata.id);
  };
}
