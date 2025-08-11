import { FlexWrapper } from '@affine/component';
import {
  createDocExplorerContext,
  DocExplorerContext,
} from '@affine/core/components/explorer/context';
import type { ExplorerDisplayPreference } from '@affine/core/components/explorer/types';
import { EmptyPodcastDetail } from '@affine/core/components/learnify/empty/podcast-detail';
import { SimplePodcastsList } from '@affine/core/components/learnify/podcasts/explorer/simple-podcasts-list';
import { LEARNIFY_COLLECTIONS } from '@affine/core/constants/learnify-collections';
import {
  type Collection,
  CollectionService,
} from '@affine/core/modules/collection';
import { GlobalContextService } from '@affine/core/modules/global-context';
import { useI18n } from '@affine/i18n';
import { useLiveData, useServices } from '@toeverything/infra';
import { useCallback, useEffect, useState } from 'react';

import {
  useIsActiveView,
  ViewBody,
  ViewHeader,
  ViewIcon,
  ViewTitle,
} from '../../../../../modules/workbench';
import { PageNotFound } from '../../../404';
import { PodcastsHeader } from './header';
import * as styles from './index.css';
import { PlayerWrapper } from './player-wrapper';

export const CollectionDetail = ({
  collection: _collection,
}: {
  collection: Collection;
}) => {
  const [explorerContextValue] = useState(() =>
    createDocExplorerContext({
      view: 'list',
      displayProperties: ['system:updatedAt', 'system:updatedBy'],
      showDocIcon: true,
      showDocPreview: false,
    })
  );
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  const handleEditorLoad = useCallback(() => {
    // 播放器加载完成后的回调
  }, []);

  // 监听选中的文档ID变化
  const selectedDocIds = useLiveData(explorerContextValue.selectedDocIds$);

  const displayPreference = useLiveData(
    explorerContextValue.displayPreference$
  );

  const handleDisplayPreferenceChange = useCallback(
    (displayPreference: ExplorerDisplayPreference) => {
      explorerContextValue.displayPreference$.next(displayPreference);
    },
    [explorerContextValue]
  );

  useEffect(() => {
    // Auto-select first podcast if none selected
    if (!hasAutoSelected && selectedDocIds.length === 0) {
      setHasAutoSelected(true);
      explorerContextValue.selectedDocIds$.next(['podcast-001']);
    }
  }, [explorerContextValue.selectedDocIds$, selectedDocIds, hasAutoSelected]);

  return (
    <DocExplorerContext.Provider value={explorerContextValue}>
      <ViewHeader>
        <PodcastsHeader
          displayPreference={displayPreference}
          onDisplayPreferenceChange={handleDisplayPreferenceChange}
        />
      </ViewHeader>
      <ViewBody>
        <FlexWrapper flexDirection="column" alignItems="stretch" width="55%">
          <div className={styles.scrollArea}>
            <SimplePodcastsList />
          </div>
        </FlexWrapper>
        <FlexWrapper
          flexDirection="column"
          alignItems="stretch"
          width="45%"
          className={styles.rightPanel}
        >
          <PlayerWrapper onLoad={handleEditorLoad} />
        </FlexWrapper>
      </ViewBody>
    </DocExplorerContext.Provider>
  );
};

export const Component = function CollectionPage() {
  const { collectionService, globalContextService } = useServices({
    CollectionService,
    GlobalContextService,
  });
  const globalContext = globalContextService.globalContext;
  const t = useI18n();
  const collection = useLiveData(
    collectionService.collection$(LEARNIFY_COLLECTIONS.PODCASTS)
  );
  const name = useLiveData(collection?.name$);
  const isActiveView = useIsActiveView();

  useEffect(() => {
    if (isActiveView && collection) {
      globalContext.collectionId.set(collection.id);
      globalContext.isCollection.set(true);

      return () => {
        globalContext.collectionId.set(null);
        globalContext.isCollection.set(false);
      };
    }
    return;
  }, [collection, globalContext, isActiveView]);

  const info = useLiveData(collection?.info$);

  if (!collection) {
    return <PageNotFound />;
  }
  const inner =
    info?.allowList.length === 0 && info?.rules.filters.length === 0 ? (
      <Placeholder collection={collection} />
    ) : (
      <CollectionDetail collection={collection} />
    );

  return (
    <>
      <ViewIcon icon="collection" />
      <ViewTitle title={name ?? t['Untitled']()} />
      {inner}
    </>
  );
};

const Placeholder = ({ collection }: { collection: Collection }) => {
  const [explorerContextValue] = useState(() =>
    createDocExplorerContext({
      view: 'list',
      displayProperties: ['system:updatedAt', 'system:updatedBy'],
      showDocIcon: true,
      showDocPreview: false,
    })
  );

  const displayPreference = useLiveData(
    explorerContextValue.displayPreference$
  );

  const handleDisplayPreferenceChange = useCallback(
    (displayPreference: ExplorerDisplayPreference) => {
      explorerContextValue.displayPreference$.next(displayPreference);
    },
    [explorerContextValue]
  );

  return (
    <>
      <ViewHeader>
        <PodcastsHeader
          displayPreference={displayPreference}
          onDisplayPreferenceChange={handleDisplayPreferenceChange}
        />
      </ViewHeader>
      <ViewBody>
        <EmptyPodcastDetail
          collection={collection}
          style={{ height: '100%' }}
        />
      </ViewBody>
    </>
  );
};
