import { createContext } from 'react';

export const JournalDatePickerContext = createContext<{
  width: number;
  /**
   * Is used to determine the current date, not same as selected,
   * `is-current-month` is based on cursor
   */
  cursor: string;
  setCursor: (date: string) => void;
  selected: string;
  onSelect: (date: string) => void;
  withDotDates: Set<string | null | undefined>;
}>({
  width: window.innerWidth,
  cursor: '',
  setCursor: () => {},
  selected: '',
  onSelect: () => {},
  withDotDates: new Set(),
});
