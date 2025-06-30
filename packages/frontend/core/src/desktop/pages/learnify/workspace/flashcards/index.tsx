import { useI18n } from '@affine/i18n';

import {
  ViewBody,
  ViewHeader,
  ViewIcon,
  ViewTitle,
} from '../../../../../modules/workbench';
import { AllDocSidebarTabs } from '../../../workspace/layouts/all-doc-sidebar-tabs';
import * as styles from './flashcards.css';
import { FlashcardsHeader } from './header';

export const Flashcards = () => {
  const t = useI18n();

  return (
    <>
      <ViewTitle title={t['Flashcards']()} />
      <ViewIcon icon="flashcard" />
      <ViewHeader>
        <FlashcardsHeader />
      </ViewHeader>
      <ViewBody>
        <div className={styles.body}>TODO: this is Flashcards Page</div>
      </ViewBody>
      <AllDocSidebarTabs />
    </>
  );
};

export const Component = () => {
  return <Flashcards />;
};
