import { OnEvent, Service } from '@toeverything/infra';

import { DocsService } from '../../doc';
import type { Workspace } from '../../workspace';
import { WorkspaceInitialized } from '../../workspace';
import {
  EditorSetting,
  type EditorSettingExt,
} from '../entities/editor-setting';

@OnEvent(WorkspaceInitialized, e => e.onWorkspaceInitialized)
export class EditorSettingService extends Service {
  editorSetting = this.framework.createEntity(
    EditorSetting
  ) as EditorSettingExt;

  onWorkspaceInitialized(workspace: Workspace) {
    // set default mode for new doc

    workspace.docCollection.slots.docCreated.subscribe(docId => {
      const preferMode = this.editorSetting.settings$.value.newDocDefaultMode;
      const docsService = workspace.scope.get(DocsService);
      const mode = preferMode === 'ask' ? 'page' : preferMode;
      docsService.list.setPrimaryMode(docId, mode);
    });
    // never dispose, because this service always live longer than workspace
  }
}
