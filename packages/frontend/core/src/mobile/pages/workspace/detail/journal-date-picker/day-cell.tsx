import dayjs from 'dayjs';
import { memo, useContext, useMemo } from 'react';

import { DATE_FORMAT } from './constants';
import { JournalDatePickerContext } from './context';
import { dayCell, dot } from './day-cell.css';

export interface DayCellProps {
  date: string;
}

export const DayCell = memo(function DayCell({ date }: DayCellProps) {
  const { selected, onSelect, cursor, withDotDates } = useContext(
    JournalDatePickerContext
  );

  const dayjsObj = useMemo(() => dayjs(date), [date]);

  const isToday = dayjsObj.isSame(dayjs(), 'day');
  const isSelected = dayjsObj.isSame(dayjs(selected), 'day');
  const isCurrentMonth = dayjsObj.isSame(dayjs(cursor), 'month');
  const day = dayjsObj.get('date');
  const label = dayjsObj.format(DATE_FORMAT);
  const hasDot = withDotDates.has(date);

  return (
    <div
      className={dayCell}
      data-is-today={isToday}
      data-is-selected={isSelected}
      data-is-current-month={isCurrentMonth}
      aria-label={label}
      onClick={() => onSelect(date)}
    >
      {day}
      {hasDot && <div className={dot} />}
    </div>
  );
});
