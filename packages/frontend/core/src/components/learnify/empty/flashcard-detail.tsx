import { useI18n } from '@affine/i18n';

import { EmptyLayout } from '../../affine/empty/layout';
import type { UniversalEmptyProps } from '../../affine/empty/types';
import collectionDetailDark from './assets/collection-detail.dark.png';
import collectionDetailLight from './assets/collection-detail.light.png';

export interface EmptyFlashcardDetailProps extends UniversalEmptyProps {}

export const EmptyFlashcardDetail = (props: EmptyFlashcardDetailProps) => {
  const t = useI18n();

  return (
    <EmptyLayout
      illustrationLight={collectionDetailLight}
      illustrationDark={collectionDetailDark}
      title={t['com.learnify.empty.flashcard-detail.title']()}
      description={t['com.learnify.empty.flashcard-detail.description']()}
      {...props}
    />
  );
};
