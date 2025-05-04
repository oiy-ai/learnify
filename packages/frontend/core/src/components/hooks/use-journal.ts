import { DocsService } from '@affine/core/modules/doc';
import { EditorSettingService } from '@affine/core/modules/editor-setting';
import {
  JOURNAL_DATE_FORMAT,
  JournalService,
  type MaybeDate,
} from '@affine/core/modules/journal';
import type { WorkbenchOpenOptions } from '@affine/core/modules/workbench/entities/workbench';
import { i18nTime } from '@affine/i18n';
import { track } from '@affine/track';
import { useService, useServices } from '@toeverything/infra';
import dayjs from 'dayjs';
import { useCallback, useMemo } from 'react';

import { WorkbenchService } from '../../modules/workbench';

function isJournalString(j?: string | false) {
  return j ? !!j?.match(/^\d{4}-\d{2}-\d{2}$/) : false;
}

function toDayjs(j?: string | false) {
  if (!j || !isJournalString(j)) return null;
  const day = dayjs(j);
  if (!day.isValid()) return null;
  return day;
}

/**
 * @deprecated use `JournalService` directly
 */
export const useJournalHelper = () => {
  const { journalService } = useServices({
    DocsService,
    EditorSettingService,
    JournalService,
  });

  /**
   * get journal by date, create one if not exist
   */
  const getJournalByDate = useCallback(
    (maybeDate: MaybeDate) => {
      return journalService.ensureJournalByDate(maybeDate);
    },
    [journalService]
  );

  return useMemo(
    () => ({
      getJournalByDate,
    }),
    [getJournalByDate]
  );
};

// split useJournalRouteHelper since it requires a <Route /> context, which may not work in lit
export const useJournalRouteHelper = () => {
  const { getJournalByDate } = useJournalHelper();
  const workbench = useService(WorkbenchService).workbench;
  /**
   * open journal by date, create one if not exist
   */
  const openJournal = useCallback(
    (maybeDate: MaybeDate, options?: WorkbenchOpenOptions) => {
      const page = getJournalByDate(maybeDate);
      workbench.openDoc(page.id, options);
      track.$.navigationPanel.journal.navigate({
        to: 'journal',
      });
      return page.id;
    },
    [getJournalByDate, workbench]
  );

  /**
   * open today's journal
   */
  const openToday = useCallback(
    (options: WorkbenchOpenOptions) => {
      const date = dayjs().format(JOURNAL_DATE_FORMAT);
      return openJournal(date, options);
    },
    [openJournal]
  );

  return useMemo(
    () => ({
      openJournal,
      openToday,
    }),
    [openJournal, openToday]
  );
};

/**
 * @deprecated use `JournalService` directly
 */
export const useJournalInfoHelper = (pageId?: string | null) => {
  const journalService = useService(JournalService);

  const isPageJournal = useCallback(
    (pageId: string) => {
      return !!journalService.journalDate$(pageId).value;
    },
    [journalService]
  );

  const isPageTodayJournal = useCallback(
    (pageId: string) => {
      const date = dayjs().format(JOURNAL_DATE_FORMAT);
      const d = journalService.journalDate$(pageId).value;
      return isPageJournal(pageId) && d === date;
    },
    [isPageJournal, journalService]
  );

  const getJournalDateString = useCallback(
    (pageId: string) => {
      return journalService.journalDate$(pageId).value;
    },
    [journalService]
  );

  const getLocalizedJournalDateString = useCallback(
    (pageId: string) => {
      const journalDateString = getJournalDateString(pageId);
      if (!journalDateString) return null;
      return i18nTime(journalDateString, { absolute: { accuracy: 'day' } });
    },
    [getJournalDateString]
  );

  return useMemo(
    () => ({
      isJournal: pageId ? isPageJournal(pageId) : false,
      journalDate: pageId ? toDayjs(getJournalDateString(pageId)) : null,
      localizedJournalDate: pageId
        ? getLocalizedJournalDateString(pageId)
        : null,
      isTodayJournal: pageId ? isPageTodayJournal(pageId) : false,
      isPageJournal,
      isPageTodayJournal,
      getJournalDateString,
      getLocalizedJournalDateString,
    }),
    [
      getJournalDateString,
      getLocalizedJournalDateString,
      isPageJournal,
      isPageTodayJournal,
      pageId,
    ]
  );
};
