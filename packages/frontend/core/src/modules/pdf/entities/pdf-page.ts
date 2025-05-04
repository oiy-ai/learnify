import { DebugLogger } from '@affine/debug';
import {
  catchErrorInto,
  effect,
  Entity,
  LiveData,
  mapInto,
} from '@toeverything/infra';
import { filter, map, switchMap } from 'rxjs';

import type { RenderPageOpts } from '../renderer';
import type { PDF } from './pdf';

const logger = new DebugLogger('affine:pdf:page:render');

export class PDFPage extends Entity<{ pdf: PDF; pageNum: number }> {
  readonly pageNum: number = this.props.pageNum;
  bitmap$ = new LiveData<ImageBitmap | null>(null);
  error$ = new LiveData<any>(null);

  render = effect(
    switchMap((opts: Omit<RenderPageOpts, 'pageNum'>) =>
      this.props.pdf.renderer.ob$('render', {
        ...opts,
        pageNum: this.pageNum,
      })
    ),
    map(data => data?.bitmap),
    filter(Boolean),
    mapInto(this.bitmap$),
    catchErrorInto(this.error$, error => {
      logger.error('Failed to render page', error);
    })
  );

  constructor() {
    super();
    this.disposables.push(() => this.render.unsubscribe);
  }
}
