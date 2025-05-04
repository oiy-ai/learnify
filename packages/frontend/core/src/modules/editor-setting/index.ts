import { type Framework } from '@toeverything/infra';

import { ServersService } from '../cloud';
import { DesktopApiService } from '../desktop-api';
import { I18n } from '../i18n';
import { GlobalState, GlobalStateService } from '../storage';
import { EditorSetting } from './entities/editor-setting';
import { CurrentUserDBEditorSettingProvider } from './impls/user-db';
import { EditorSettingProvider } from './provider/editor-setting-provider';
import { EditorSettingService } from './services/editor-setting';
import { SpellCheckSettingService } from './services/spell-check-setting';
import { TraySettingService } from './services/tray-settings';
export type { FontFamily } from './schema';
export { EditorSettingSchema, fontStyleOptions } from './schema';
export { EditorSettingService } from './services/editor-setting';

export function configureEditorSettingModule(framework: Framework) {
  framework
    .service(EditorSettingService)
    .entity(EditorSetting, [EditorSettingProvider])
    .impl(EditorSettingProvider, CurrentUserDBEditorSettingProvider, [
      ServersService,
      GlobalState,
    ]);
}

export function configureSpellCheckSettingModule(framework: Framework) {
  framework.service(SpellCheckSettingService, [
    GlobalStateService,
    I18n,
    DesktopApiService,
  ]);
}

export function configureTraySettingModule(framework: Framework) {
  framework.service(TraySettingService, [GlobalStateService]);
}
