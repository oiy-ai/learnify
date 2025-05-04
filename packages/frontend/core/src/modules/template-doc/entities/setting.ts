import { Entity } from '@toeverything/infra';

import type { TemplateDocSettingStore } from '../store/setting';

export class TemplateDocSetting extends Entity {
  constructor(private readonly store: TemplateDocSettingStore) {
    super();
  }

  loading$ = this.store.watchIsLoading();
  setting$ = this.store.watchSetting();
  enablePageTemplate$ = this.store.watchSettingKey('enablePageTemplate');
  pageTemplateDocId$ = this.store.watchSettingKey('pageTemplateId');
  journalTemplateDocId$ = this.store.watchSettingKey('journalTemplateId');

  togglePageTemplate(enable: boolean) {
    this.store.updateSetting('enablePageTemplate', enable);
  }

  updatePageTemplateDocId(id?: string) {
    this.store.updateSetting('pageTemplateId', id);
  }

  updateJournalTemplateDocId(id?: string) {
    this.store.updateSetting('journalTemplateId', id);
  }
}
