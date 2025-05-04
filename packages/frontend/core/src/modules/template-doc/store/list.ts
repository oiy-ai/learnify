import { Store } from '@toeverything/infra';
import { map } from 'rxjs';

import type { WorkspaceDBService } from '../../db';

export class TemplateDocListStore extends Store {
  constructor(private readonly dbService: WorkspaceDBService) {
    super();
  }

  isTemplateDoc(docId: string) {
    return !!this.dbService.db.docProperties.find({
      id: docId,
      isTemplate: true,
    })[0]?.isTemplate;
  }

  watchTemplateDoc(docId: string) {
    return this.dbService.db.docProperties
      .find$({ id: docId, isTemplate: true })
      .pipe(map(res => res[0]?.isTemplate));
  }

  getTemplateDocIds() {
    return this.dbService.db.docProperties
      .find({ isTemplate: true })
      .map(property => property.id);
  }

  watchTemplateDocs() {
    return this.dbService.db.docProperties.find$({ isTemplate: true });
  }
}
