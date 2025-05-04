import type { Framework } from '@toeverything/infra';

import { WorkspaceDBService } from '../db';
import { DocsService } from '../doc';
import { WorkspaceScope } from '../workspace';
import { TemplateDocList } from './entities/list';
import { TemplateDocSetting } from './entities/setting';
import { TemplateDocService } from './services/template-doc';
import { TemplateDocListStore } from './store/list';
import { TemplateDocSettingStore } from './store/setting';

export { TemplateDocService };

export const configureTemplateDocModule = (framework: Framework) => {
  framework
    .scope(WorkspaceScope)
    .service(TemplateDocService)
    .store(TemplateDocListStore, [WorkspaceDBService])
    .entity(TemplateDocList, [TemplateDocListStore, DocsService])
    .store(TemplateDocSettingStore, [WorkspaceDBService])
    .entity(TemplateDocSetting, [TemplateDocSettingStore]);
};
