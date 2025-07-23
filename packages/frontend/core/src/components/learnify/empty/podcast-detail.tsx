import { useI18n } from '@affine/i18n';

import { EmptyLayout } from '../../affine/empty/layout';
import type { UniversalEmptyProps } from '../../affine/empty/types';
import collectionDetailDark from './assets/collection-detail.dark.png';
import collectionDetailLight from './assets/collection-detail.light.png';

export interface EmptyPodcastDetailProps extends UniversalEmptyProps {}

export const EmptyPodcastDetail = (props: EmptyPodcastDetailProps) => {
  const t = useI18n();

  return (
    <EmptyLayout
      illustrationLight={collectionDetailLight}
      illustrationDark={collectionDetailDark}
      title={t['com.learnify.empty.podcast-detail.title']()}
      description={t['com.learnify.empty.podcast-detail.description']()}
      {...props}
    />
  );
};
