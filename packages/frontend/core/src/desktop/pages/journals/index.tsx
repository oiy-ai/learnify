import { useJournalRouteHelper } from '@affine/core/components/hooks/use-journal';
import { useEffect } from 'react';

// this route page acts as a redirector to today's journal
export const Component = () => {
  const { openToday } = useJournalRouteHelper();
  useEffect(() => {
    openToday({ replaceHistory: true });
  }, [openToday]);
  return null;
};
