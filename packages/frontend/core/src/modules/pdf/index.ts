import type { Framework } from '@toeverything/infra';

import { WorkspaceScope } from '../workspace';
import { PDF } from './entities/pdf';
import { PDFPage } from './entities/pdf-page';
import { PDFService } from './services/pdf';

export function configurePDFModule(framework: Framework) {
  framework
    .scope(WorkspaceScope)
    .service(PDFService)
    .entity(PDF)
    .entity(PDFPage);
}

export { PDF, type PDFRendererState, PDFStatus } from './entities/pdf';
export { PDFPage } from './entities/pdf-page';
export { PDFRenderer } from './renderer';
export { PDFService } from './services/pdf';
