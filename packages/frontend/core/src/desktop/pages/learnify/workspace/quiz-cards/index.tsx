import type { Filter } from '@affine/env/filter';
import { useI18n } from '@affine/i18n';
import { useState } from 'react';

import {
  ViewBody,
  ViewHeader,
  ViewIcon,
  ViewTitle,
} from '../../../../../modules/workbench';
import { AllPageHeader } from '../header/common-header';

export const QuizCardsPage = () => {
  const t = useI18n();

  const [hideHeaderCreateNew] = useState(true);
  const [filters, setFilters] = useState<Filter[]>([]);

  return (
    <>
      <ViewTitle title={t['com.learnify.quiz-cards.header']()} />
      <ViewIcon icon="page" />
      <ViewHeader>
        <AllPageHeader
          showCreateNew={!hideHeaderCreateNew}
          filters={filters}
          onChangeFilters={setFilters}
          activeFilter="quiz-cards"
        />
      </ViewHeader>
      <ViewBody>
        <div style={{ padding: '40px', textAlign: 'center', fontSize: '20px' }}>
          TODO: Quiz Cards Page Implementation
        </div>
      </ViewBody>
    </>
  );
};

export const Component = () => {
  return <QuizCardsPage />;
};
