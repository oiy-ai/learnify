import { useThemeColorV2 } from '@affine/component';

import { Page } from '../../components/page';
import { AllDocList, AllDocsHeader } from '../../views';

export const Component = () => {
  useThemeColorV2('layer/background/mobile/primary');

  return (
    <Page header={<AllDocsHeader />} tab>
      <AllDocList />
    </Page>
  );
};
