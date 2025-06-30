import {
  AllDocsIcon,
  AttachmentIcon,
  DeleteIcon,
  EdgelessIcon,
  ExportToPdfIcon,
  PageIcon,
  TagIcon,
  TodayIcon,
  ViewLayersIcon,
} from '@blocksuite/icons/rc';
import type { ReactNode } from 'react';

export const iconNameToIcon = {
  allDocs: <AllDocsIcon />,
  collection: <ViewLayersIcon />,
  doc: <PageIcon />,
  note: <PageIcon />,
  mindMap: <PageIcon />,
  flashcard: <PageIcon />,
  podcast: <PageIcon />,
  // TODO update Icons
  page: <PageIcon />,
  edgeless: <EdgelessIcon />,
  journal: <TodayIcon />,
  tag: <TagIcon />,
  trash: <DeleteIcon />,
  attachment: <AttachmentIcon />,
  pdf: <ExportToPdfIcon />,
} satisfies Record<string, ReactNode>;

export type ViewIconName = keyof typeof iconNameToIcon;
