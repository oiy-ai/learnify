import { EmptyCollectionDetail } from '@affine/core/components/affine/empty';
import { isEmptyCollection } from '@affine/core/desktop/pages/workspace/collection';
import { AppTabs, PageHeader } from '@affine/core/mobile/components';
import { Page } from '@affine/core/mobile/components/page';
import type { Collection } from '@affine/env/filter';
import { ViewLayersIcon } from '@blocksuite/icons/rc';

import { AllDocList } from '../doc/list';
import * as styles from './detail.css';

export const DetailHeader = ({ collection }: { collection: Collection }) => {
  return (
    <PageHeader className={styles.header} back>
      <div className={styles.headerContent}>
        <ViewLayersIcon className={styles.headerIcon} />
        {collection.name}
      </div>
    </PageHeader>
  );
};

export const CollectionDetail = ({
  collection,
}: {
  collection: Collection;
}) => {
  if (isEmptyCollection(collection)) {
    return (
      <>
        <DetailHeader collection={collection} />
        <EmptyCollectionDetail collection={collection} absoluteCenter />
        <AppTabs />
      </>
    );
  }

  return (
    <Page header={<DetailHeader collection={collection} />}>
      <AllDocList collection={collection} />
    </Page>
  );
};
