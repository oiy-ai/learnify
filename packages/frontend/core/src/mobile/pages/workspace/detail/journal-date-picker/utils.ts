import dayjs from 'dayjs';

import { DATE_FORMAT } from './constants';

export const getFirstDayOfMonth = (date: string, offset: number) => {
  return dayjs(date).add(offset, 'month').startOf('month').format(DATE_FORMAT);
};
export const getFirstDayOfWeek = (date: string, offset: number) => {
  return dayjs(date).add(offset, 'week').startOf('week').format(DATE_FORMAT);
};
