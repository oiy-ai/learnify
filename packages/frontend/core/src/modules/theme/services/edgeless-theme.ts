import { OnEvent, Service } from '@toeverything/infra';

import type { DocRecord } from '../../doc';
import { DocCreated } from '../../doc';
import type { EditorSettingService } from '../../editor-setting';
import type { EdgelessDefaultTheme } from '../../editor-setting/schema';
import type { AppThemeService } from './theme';

const getValueByDefaultTheme = (
  defaultTheme: EdgelessDefaultTheme,
  currentAppTheme: string
) => {
  switch (defaultTheme) {
    case 'dark':
      return 'dark';
    case 'light':
      return 'light';
    case 'specified':
      return currentAppTheme === 'dark' ? 'dark' : 'light';
    case 'auto':
      return 'system';
    default:
      return 'system';
  }
};

@OnEvent(DocCreated, i => i.onDocCreated)
export class EdgelessThemeService extends Service {
  constructor(
    private readonly appThemeService: AppThemeService,
    private readonly editorSettingService: EditorSettingService
  ) {
    super();
  }

  onDocCreated(docRecord: DocRecord) {
    const value = getValueByDefaultTheme(
      this.editorSettingService.editorSetting.get('edgelessDefaultTheme'),
      this.appThemeService.appTheme.theme$.value ?? 'light'
    );
    docRecord.setProperty('edgelessColorTheme', value);
  }
}
