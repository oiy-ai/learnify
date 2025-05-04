import { Page } from '@affine/core/mobile/components/page';
import type { Tag } from '@affine/core/modules/tag';

import { AllDocList } from '../doc';
import { TagDetailHeader } from './detail-header';

export const TagDetail = ({ tag }: { tag: Tag }) => {
  return (
    <Page header={<TagDetailHeader tag={tag} />} tab>
      <AllDocList tag={tag} />
    </Page>
  );
};
