import { RadioGroup, type RadioItem } from '@affine/component';
import type { AllPageFilterOption } from '@affine/core/components/atoms';
import { allPageFilterSelectAtom } from '@affine/core/components/atoms';
import { WorkbenchService } from '@affine/core/modules/workbench';
import { useI18n } from '@affine/i18n';
import { useService } from '@toeverything/infra';
import { useAtom } from 'jotai';
import { useCallback, useEffect, useMemo, useState } from 'react';

import * as styles from './index.css';

export const WorkspaceModeFilterTab = ({
  activeFilter,
}: {
  activeFilter: AllPageFilterOption;
}) => {
  const t = useI18n();
  const [value, setValue] = useState(activeFilter);
  const [filterMode, setFilterMode] = useAtom(allPageFilterSelectAtom);
  const workbenchService = useService(WorkbenchService);
  const handleValueChange = useCallback(
    (value: AllPageFilterOption) => {
      switch (value) {
        case 'collections':
          workbenchService.workbench.openCollections();
          break;
        case 'tags':
          workbenchService.workbench.openTags();
          break;
        case 'docs':
          workbenchService.workbench.openAll();
          break;
        case 'notes':
          workbenchService.workbench.openNotes();
          break;
        case 'mind-map':
          workbenchService.workbench.openMindMap();
          break;
        case 'quiz-cards':
          workbenchService.workbench.openQACards();
          break;
        case 'flashcards':
          workbenchService.workbench.openFlashcards();
          break;
        case 'podcasts':
          workbenchService.workbench.openPodcasts();
          break;
      }
    },
    [workbenchService.workbench]
  );

  useEffect(() => {
    if (value !== activeFilter) {
      setValue(activeFilter);
      setFilterMode(activeFilter);
    }
  }, [activeFilter, filterMode, setFilterMode, value]);

  return (
    <RadioGroup
      style={{ maxWidth: '100%', width: 380 }}
      value={value}
      onChange={handleValueChange}
      items={useMemo<RadioItem[]>(
        () => [
          // {
          //   value: 'docs',
          //   label: t['com.affine.docs.header'](),
          //   testId: 'workspace-docs-button',
          //   className: styles.filterTab,
          // },
          // {
          //   value: 'collections',
          //   label: t['com.affine.collections.header'](),
          //   testId: 'workspace-collections-button',
          //   className: styles.filterTab,
          // },
          // {
          //   value: 'tags',
          //   label: t['Tags'](),
          //   testId: 'workspace-tags-button',
          //   className: styles.filterTab,
          // },
          {
            value: 'notes',
            label: t['com.learnify.notes.header'](),
            testId: 'workspace-notes-button',
            className: styles.filterTab,
          },
          {
            value: 'mind-map',
            label: t['com.learnify.mind-map.header'](),
            testId: 'workspace-mind-map-button',
            className: styles.filterTab,
          },
          {
            value: 'quiz-cards',
            label: t['com.learnify.quiz-cards.header'](),
            testId: 'workspace-quiz-cards-button',
            className: styles.filterTab,
          },
          {
            value: 'flashcards',
            label: t['com.learnify.flashcards.header'](),
            testId: 'workspace-flashcards-button',
            className: styles.filterTab,
          },
          {
            value: 'podcasts',
            label: t['com.learnify.podcasts.header'](),
            testId: 'workspace-podcasts-button',
            className: styles.filterTab,
          },
        ],
        [t]
      )}
    />
  );
};
