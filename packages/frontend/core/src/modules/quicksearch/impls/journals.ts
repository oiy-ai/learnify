import { I18n, i18nTime } from '@affine/i18n';
import { DateTimeIcon } from '@blocksuite/icons/rc';
import { Entity, LiveData } from '@toeverything/infra';

import type { WorkspaceDialogService } from '../../dialogs';
import type { DocDisplayMetaService } from '../../doc-display-meta';
import { type JournalService, suggestJournalDate } from '../../journal';
import type { QuickSearchSession } from '../providers/quick-search-provider';
import type { QuickSearchGroup } from '../types/group';
import type { QuickSearchItem } from '../types/item';

const group: QuickSearchGroup = {
  id: 'journals',
  label: {
    i18nKey: 'com.affine.cmdk.affine.category.affine.journal',
  },
  score: 0,
};

type JournalQuickSearchItem = QuickSearchItem<
  'date-picker',
  { getDocId: () => Promise<string | undefined> }
>;

export class JournalsQuickSearchSession
  extends Entity
  implements
    QuickSearchSession<
      'date-picker',
      { getDocId: () => Promise<string | undefined> }
    >
{
  constructor(
    private readonly journalService: JournalService,
    private readonly dialogService: WorkspaceDialogService,
    private readonly docDisplayMetaService: DocDisplayMetaService
  ) {
    super();
  }

  query$ = new LiveData('');

  items$: LiveData<JournalQuickSearchItem[]> = LiveData.computed(get => {
    const getDateDocId = (date?: string) => {
      if (date) {
        return this.journalService.ensureJournalByDate(date).id;
      }
      return undefined;
    };

    const items: JournalQuickSearchItem[] = [
      {
        icon: DateTimeIcon,
        id: 'journal:pick-a-date',
        source: 'date-picker',
        group: group,
        label: {
          title: I18n.t('com.affine.cmdk.affine.category.affine.date-picker'),
        },
        score: 0,
        payload: {
          getDocId: () => {
            return new Promise(resolve => {
              const id = this.dialogService.open('date-selector', {
                onSelect: date => {
                  resolve(getDateDocId(date));
                  this.dialogService.close(id);
                },
              });
            });
          },
        },
      },
    ];

    const query = get(this.query$);
    const suggestedDate = suggestJournalDate(query);

    if (suggestedDate) {
      const { dateString, alias } = suggestedDate;
      const dateDisplay = i18nTime(dateString, {
        absolute: { accuracy: 'day' },
      });

      const icon = this.docDisplayMetaService.getJournalIcon(dateString, {
        type: 'rc',
      });

      items.unshift({
        icon,
        id: 'journal:date-' + dateString,
        source: 'date-picker',
        group: group,
        label: {
          title: alias ? `${alias}, ${dateDisplay}` : dateDisplay,
        },
        score: 0,
        payload: {
          getDocId: () => Promise.resolve(getDateDocId(dateString)),
        },
      });
    }

    return items;
  });

  query(query: string) {
    this.query$.next(query);
  }
}
