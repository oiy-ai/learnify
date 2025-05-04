import { Modal } from '@affine/component';
import type {
  DialogComponentProps,
  WORKSPACE_DIALOG_SCHEMA,
} from '@affine/core/modules/dialogs';
import { TagService } from '@affine/core/modules/tag';
import { useI18n } from '@affine/i18n';
import { useLiveData, useService } from '@toeverything/infra';
import { cssVarV2 } from '@toeverything/theme/v2';
import { useMemo } from 'react';

import { GenericSelector } from './generic-selector';

const TagIcon = ({ tagId }: { tagId: string }) => {
  const tagService = useService(TagService);
  const tag = useLiveData(tagService.tagList.tagByTagId$(tagId));
  const color = useLiveData(tag?.color$);

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="4" fill={color} />
    </svg>
  );
};

const TagLabel = ({ tagId }: { tagId: string }) => {
  const tagService = useService(TagService);
  const tag = useLiveData(tagService.tagList.tagByTagId$(tagId));
  const name = useLiveData(tag?.value$);

  return name;
};

export const TagSelectorDialog = ({
  close,
  init,
  onBeforeConfirm,
}: DialogComponentProps<WORKSPACE_DIALOG_SCHEMA['tag-selector']>) => {
  const t = useI18n();
  const tagService = useService(TagService);
  const tags = useLiveData(tagService.tagList.tags$);

  const list = useMemo(() => {
    return tags.map(tag => ({
      id: tag.id,
      icon: <TagIcon tagId={tag.id} />,
      label: <TagLabel tagId={tag.id} />,
    }));
  }, [tags]);

  return (
    <Modal
      open
      onOpenChange={() => close()}
      withoutCloseButton
      fullScreen
      contentOptions={{
        style: {
          background: cssVarV2('layer/background/secondary'),
          padding: 0,
        },
      }}
    >
      <GenericSelector
        onBack={close}
        onConfirm={close}
        onBeforeConfirm={onBeforeConfirm}
        initial={init}
        data={list}
        typeName={t[`com.affine.m.selector.type-tag`]()}
      />
    </Modal>
  );
};
