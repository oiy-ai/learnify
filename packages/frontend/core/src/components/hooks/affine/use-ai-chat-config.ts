// packages/frontend/core/src/blocksuite/ai/hooks/useChatPanelConfig.ts
import { AINetworkSearchService } from '@affine/core/modules/ai-button/services/network-search';
import { AIPlaygroundService } from '@affine/core/modules/ai-button/services/playground';
import { AIReasoningService } from '@affine/core/modules/ai-button/services/reasoning';
// import { CollectionService } from '@affine/core/modules/collection';
import { DocsService } from '@affine/core/modules/doc';
import { DocDisplayMetaService } from '@affine/core/modules/doc-display-meta';
import { DocsSearchService } from '@affine/core/modules/docs-search';
import {
  type SearchCollectionMenuAction,
  type SearchDocMenuAction,
  SearchMenuService,
  type SearchTagMenuAction,
} from '@affine/core/modules/search-menu/services';
import { TagService } from '@affine/core/modules/tag';
import { WorkspaceService } from '@affine/core/modules/workspace';
import { createSignalFromObservable } from '@blocksuite/affine/shared/utils';
import { Signal } from '@preact/signals-core';
import { useFramework } from '@toeverything/infra';

export function useAIChatConfig() {
  const framework = useFramework();

  const searchService = framework.get(AINetworkSearchService);
  const reasoningService = framework.get(AIReasoningService);
  const playgroundService = framework.get(AIPlaygroundService);
  const docDisplayMetaService = framework.get(DocDisplayMetaService);
  const workspaceService = framework.get(WorkspaceService);
  const searchMenuService = framework.get(SearchMenuService);
  const docsSearchService = framework.get(DocsSearchService);
  const tagService = framework.get(TagService);
  // const collectionService = framework.get(CollectionService);
  const docsService = framework.get(DocsService);

  const networkSearchConfig = {
    visible: searchService.visible,
    enabled: searchService.enabled,
    setEnabled: searchService.setEnabled,
  };

  const reasoningConfig = {
    enabled: reasoningService.enabled,
    setEnabled: reasoningService.setEnabled,
  };

  const playgroundConfig = {
    visible: playgroundService.visible,
  };

  const docDisplayConfig = {
    getIcon: (docId: string) => {
      return docDisplayMetaService.icon$(docId, { type: 'lit' }).value;
    },
    getTitle: (docId: string) => {
      return docDisplayMetaService.title$(docId).value;
    },
    getTitleSignal: (docId: string) => {
      const title$ = docDisplayMetaService.title$(docId);
      return createSignalFromObservable(title$, '');
    },
    getDocMeta: (docId: string) => {
      const docRecord = docsService.list.doc$(docId).value;
      return docRecord?.meta$.value ?? null;
    },
    getDocPrimaryMode: (docId: string) => {
      const docRecord = docsService.list.doc$(docId).value;
      return docRecord?.primaryMode$.value ?? 'page';
    },
    getDoc: (docId: string) => {
      const doc = workspaceService.workspace.docCollection.getDoc(docId);
      return doc?.getStore() ?? null;
    },
    getReferenceDocs: (docIds: string[]) => {
      const docs$ = docsSearchService.watchRefsFrom(docIds);
      return createSignalFromObservable(docs$, []);
    },
    getTags: () => {
      const tagMetas$ = tagService.tagList.tagMetas$;
      return createSignalFromObservable(tagMetas$, []);
    },
    getTagTitle: (tagId: string) => {
      const tag$ = tagService.tagList.tagByTagId$(tagId);
      return tag$.value?.value$.value ?? '';
    },
    getTagPageIds: (tagId: string) => {
      const tag$ = tagService.tagList.tagByTagId$(tagId);
      if (!tag$) return [];
      return tag$.value?.pageIds$.value ?? [];
    },
    getCollections: () => {
      // Return empty collections to hide them from AI Chat
      const emptySignal = new Signal<{ id: string; name: string }[]>([]);
      return {
        signal: emptySignal,
        cleanup: () => {
          // No cleanup needed for static empty signal
        },
      };
    },
    getCollectionPageIds: (_collectionId: string) => {
      // Return empty array for collection page IDs
      return [];
    },
  };

  const searchMenuConfig = {
    getDocMenuGroup: (
      query: string,
      action: SearchDocMenuAction,
      abortSignal: AbortSignal
    ) => {
      return searchMenuService.getDocMenuGroup(query, action, abortSignal);
    },
    getTagMenuGroup: (
      query: string,
      action: SearchTagMenuAction,
      abortSignal: AbortSignal
    ) => {
      return searchMenuService.getTagMenuGroup(query, action, abortSignal);
    },
    getCollectionMenuGroup: (
      _query: string,
      _action: SearchCollectionMenuAction,
      _abortSignal: AbortSignal
    ) => {
      // Return empty collection menu group to hide collections from AI Chat
      return {
        name: 'collections',
        items: new Signal([]),
      };
    },
  };

  return {
    networkSearchConfig,
    reasoningConfig,
    docDisplayConfig,
    searchMenuConfig,
    playgroundConfig,
  };
}
