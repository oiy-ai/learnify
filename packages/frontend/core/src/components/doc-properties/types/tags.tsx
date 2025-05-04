import { PropertyValue } from '@affine/component';
import { DocService } from '@affine/core/modules/doc';
import { TagService } from '@affine/core/modules/tag';
import { useI18n } from '@affine/i18n';
import { useLiveData, useService } from '@toeverything/infra';

import { TagsInlineEditor } from '../tags-inline-editor';
import * as styles from './tags.css';
import type { PropertyValueProps } from './types';

export const TagsValue = ({ readonly }: PropertyValueProps) => {
  const t = useI18n();

  const doc = useService(DocService).doc;

  const tagList = useService(TagService).tagList;
  const tagIds = useLiveData(tagList.tagIdsByPageId$(doc.id));
  const empty = !tagIds || tagIds.length === 0;

  return (
    <PropertyValue
      className={styles.container}
      isEmpty={empty}
      data-testid="property-tags-value"
      readonly={readonly}
    >
      <TagsInlineEditor
        className={styles.tagInlineEditor}
        placeholder={t[
          'com.affine.page-properties.property-value-placeholder'
        ]()}
        pageId={doc.id}
        onChange={() => {}}
        readonly={readonly}
      />
    </PropertyValue>
  );
};
