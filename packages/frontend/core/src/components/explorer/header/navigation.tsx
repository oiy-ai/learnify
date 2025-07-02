import { WorkbenchLink } from '@affine/core/modules/workbench';
import { useI18n } from '@affine/i18n';
import track from '@affine/track';

import * as styles from './navigation.css';

const items = [
  // {
  //   value: 'docs',
  //   label: 'com.affine.docs.header',
  //   testId: 'workspace-docs-button',
  //   to: '/all',
  // },
  {
    value: 'collections',
    label: 'com.affine.collections.header',
    testId: 'workspace-collections-button',
    to: '/collection',
  },
  // {
  //   value: 'tags',
  //   label: 'Tags',
  //   testId: 'workspace-tags-button',
  //   to: '/tag',
  // },
  {
    value: 'mind-maps',
    label: 'com.learnify.mind-map.header',
    testId: 'workspace-mind-maps-button',
    to: '/mind-maps',
  },
  {
    value: 'notes',
    label: 'com.learnify.notes.header',
    testId: 'workspace-notes-button',
    to: '/notes',
  },
  {
    value: 'flashcards',
    label: 'com.learnify.flashcards.header',
    testId: 'workspace-flashcards-button',
    to: '/flashcards/ux9-nJjWd-mH09V6d8IiU',
  },
  {
    value: 'podcasts',
    label: 'com.learnify.podcasts.header',
    testId: 'workspace-podcasts-button',
    to: '/podcasts',
  },
] as const;

type NavigationKey = (typeof items)[number]['value'];

export const ExplorerNavigation = ({ active }: { active: NavigationKey }) => {
  const t = useI18n();

  return (
    <div className={styles.container}>
      {items.map(item => (
        <WorkbenchLink
          key={item.value}
          data-testid={item.testId}
          data-active={active === item.value}
          to={item.to}
          onClick={() => {
            track.allDocs.header.navigation.navigateAllDocsRouter({
              control: item.value,
            });
          }}
          className={styles.item}
        >
          {t[item.label]()}
        </WorkbenchLink>
      ))}
    </div>
  );
};
