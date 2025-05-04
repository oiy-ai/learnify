import { TagService, useDeleteTagConfirmModal } from '@affine/core/modules/tag';
import { WorkspaceService } from '@affine/core/modules/workspace';
import { useI18n } from '@affine/i18n';
import { TagsIcon } from '@blocksuite/icons/rc';
import { LiveData, useLiveData, useService } from '@toeverything/infra';
import { useCallback, useMemo } from 'react';

import { useAsyncCallback } from '../hooks/affine-async-hooks';
import { useNavigateHelper } from '../hooks/use-navigate-helper';
import {
  type TagLike,
  TagsInlineEditor as TagsInlineEditorComponent,
} from '../tags';

interface TagsEditorProps {
  pageId: string;
  readonly?: boolean;
  focusedIndex?: number;
}

interface TagsInlineEditorProps extends TagsEditorProps {
  placeholder?: string;
  className?: string;
  onChange?: (value: unknown) => void;
}

export const TagsInlineEditor = ({
  pageId,
  readonly,
  placeholder,
  className,
  onChange,
}: TagsInlineEditorProps) => {
  const workspace = useService(WorkspaceService);
  const tagService = useService(TagService);
  const tagIds$ = tagService.tagList.tagIdsByPageId$(pageId);
  const tagIds = useLiveData(tagIds$);
  const tags = useLiveData(tagService.tagList.tags$);
  const tagColors = tagService.tagColors;

  const onCreateTag = useCallback(
    (name: string, color: string) => {
      const newTag = tagService.tagList.createTag(name, color);
      return {
        id: newTag.id,
        value: newTag.value$.value,
        color: newTag.color$.value,
      };
    },
    [tagService.tagList]
  );

  const onSelectTag = useCallback(
    (tagId: string) => {
      tagService.tagList.tagByTagId$(tagId).value?.tag(pageId);
      onChange?.(tagIds$.value);
    },
    [onChange, pageId, tagIds$, tagService.tagList]
  );

  const onDeselectTag = useCallback(
    (tagId: string) => {
      tagService.tagList.tagByTagId$(tagId).value?.untag(pageId);
      onChange?.(tagIds$.value);
    },
    [onChange, pageId, tagIds$, tagService.tagList]
  );

  const onTagChange = useCallback(
    (id: string, property: keyof TagLike, value: string) => {
      if (property === 'value') {
        tagService.tagList.tagByTagId$(id).value?.rename(value);
      } else if (property === 'color') {
        tagService.tagList.tagByTagId$(id).value?.changeColor(value);
      }
      onChange?.(tagIds$.value);
    },
    [onChange, tagIds$, tagService.tagList]
  );

  const deleteTags = useDeleteTagConfirmModal();

  const onTagDelete = useAsyncCallback(
    async (id: string) => {
      await deleteTags([id]);
      onChange?.(tagIds$.value);
    },
    [onChange, tagIds$, deleteTags]
  );

  const adaptedTags = useLiveData(
    useMemo(() => {
      return LiveData.computed(get => {
        return tags.map(tag => ({
          id: tag.id,
          value: get(tag.value$),
          color: get(tag.color$),
        }));
      });
    }, [tags])
  );

  const adaptedTagColors = useMemo(() => {
    return tagColors.map(color => ({
      id: color[0],
      value: color[1],
      name: color[0],
    }));
  }, [tagColors]);

  const navigator = useNavigateHelper();

  const jumpToTag = useCallback(
    (id: string) => {
      navigator.jumpToTag(workspace.workspace.id, id);
    },
    [navigator, workspace.workspace.id]
  );

  const t = useI18n();

  return (
    <TagsInlineEditorComponent
      tagMode="inline-tag"
      jumpToTag={jumpToTag}
      readonly={readonly}
      placeholder={placeholder}
      className={className}
      tags={adaptedTags}
      selectedTags={tagIds}
      onCreateTag={onCreateTag}
      onSelectTag={onSelectTag}
      onDeselectTag={onDeselectTag}
      tagColors={adaptedTagColors}
      onTagChange={onTagChange}
      onDeleteTag={onTagDelete}
      title={
        <>
          <TagsIcon />
          {t['Tags']()}
        </>
      }
    />
  );
};
