import { useI18n } from '@affine/i18n';

import {
  ViewBody,
  ViewHeader,
  ViewIcon,
  ViewTitle,
} from '../../../../../modules/workbench';
import { AllDocSidebarTabs } from '../../../workspace/layouts/all-doc-sidebar-tabs';
import { MindMapsHeader } from './header';
import * as styles from './mind-maps.css';

export const MindMaps = () => {
  const t = useI18n();

  return (
    <>
      <ViewTitle title={t['Mind Maps']()} />
      <ViewIcon icon="mindMap" />
      <ViewHeader>
        <MindMapsHeader />
      </ViewHeader>
      <ViewBody>
        <div className={styles.body}>TODO: this is Mind Maps Page</div>
      </ViewBody>
      <AllDocSidebarTabs />
    </>
  );
};

export const Component = () => {
  return <MindMaps />;
};
