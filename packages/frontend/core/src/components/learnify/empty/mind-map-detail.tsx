import { useI18n } from '@affine/i18n';

import { EmptyLayout } from '../../affine/empty/layout';
import type { UniversalEmptyProps } from '../../affine/empty/types';
import collectionDetailDark from './assets/collection-detail.dark.png';
import collectionDetailLight from './assets/collection-detail.light.png';

export interface EmptyMindMapDetailProps extends UniversalEmptyProps {}

export const EmptyMindMapDetail = (props: EmptyMindMapDetailProps) => {
  const t = useI18n();

  return (
    <EmptyLayout
      illustrationLight={collectionDetailLight}
      illustrationDark={collectionDetailDark}
      title={t['com.learnify.empty.mind-map-detail.title']()}
      description={t['com.learnify.empty.mind-map-detail.description']()}
      {...props}
    />
  );
};
