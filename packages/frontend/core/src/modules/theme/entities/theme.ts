import { Entity, LiveData } from '@toeverything/infra';

export class AppTheme extends Entity {
  theme$ = new LiveData<string | undefined>(undefined);
}
