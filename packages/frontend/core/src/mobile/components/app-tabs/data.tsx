import { AllDocsIcon, HomeIcon } from '@blocksuite/icons/rc';
import type { Framework } from '@toeverything/infra';

import { AppTabCreate } from './create';
import { AppTabJournal } from './journal';

interface AppTabBase {
  key: string;
  onClick?: (framework: Framework, isActive: boolean) => void;
}
export interface AppTabLink extends AppTabBase {
  Icon: React.FC;
  to: string;
  LinkComponent?: React.FC;
}

export interface AppTabCustom extends AppTabBase {
  custom: (props: AppTabCustomFCProps) => React.ReactNode;
}

export type Tab = AppTabLink | AppTabCustom;

export interface AppTabCustomFCProps {
  tab: Tab;
}

export const tabs: Tab[] = [
  {
    key: 'home',
    to: '/home',
    Icon: HomeIcon,
  },
  {
    key: 'all',
    to: '/all',
    Icon: AllDocsIcon,
  },
  {
    key: 'journal',
    custom: AppTabJournal,
  },
  {
    key: 'new',
    custom: AppTabCreate,
  },
];
