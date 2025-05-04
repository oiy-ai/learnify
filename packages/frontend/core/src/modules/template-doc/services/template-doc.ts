import { Service } from '@toeverything/infra';

import { TemplateDocList } from '../entities/list';
import { TemplateDocSetting } from '../entities/setting';

export class TemplateDocService extends Service {
  public readonly list = this.framework.createEntity(TemplateDocList);
  public readonly setting = this.framework.createEntity(TemplateDocSetting);
}
