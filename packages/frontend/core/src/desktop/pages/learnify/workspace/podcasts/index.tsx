import { useI18n } from '@affine/i18n';

import {
  ViewBody,
  ViewHeader,
  ViewIcon,
  ViewTitle,
} from '../../../../../modules/workbench';
import { AllDocSidebarTabs } from '../../../workspace/layouts/all-doc-sidebar-tabs';
import { PodcastsHeader } from './header';
import * as styles from './podcasts.css';

export const Podcasts = () => {
  const t = useI18n();

  return (
    <>
      <ViewTitle title={t['Podcasts']()} />
      <ViewIcon icon="podcast" />
      <ViewHeader>
        <PodcastsHeader />
      </ViewHeader>
      <ViewBody>
        <div className={styles.body}>TODO: this is Podcasts Page</div>
      </ViewBody>
      <AllDocSidebarTabs />
    </>
  );
};

export const Component = () => {
  return <Podcasts />;
};
