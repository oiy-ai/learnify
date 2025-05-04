import clsx from 'clsx';
import { forwardRef } from 'react';

import * as styles from './list.css';
import type { ColWrapperProps } from './types';

export const ColWrapper = forwardRef<HTMLDivElement, ColWrapperProps>(
  function ColWrapper(
    {
      flex,
      alignment,
      hideInSmallContainer,
      hidden,
      className,
      style,
      children,
      ...rest
    }: ColWrapperProps,
    ref
  ) {
    return (
      <div
        {...rest}
        ref={ref}
        data-testid="page-list-flex-wrapper"
        style={{
          ...style,
          flexGrow: flex,
          flexBasis: flex ? `${(flex / 12) * 100}%` : 'auto',
          justifyContent: alignment,
        }}
        data-hide-item={hideInSmallContainer ? true : undefined}
        className={clsx(className, styles.colWrapper, {
          [styles.hidden]: hidden,
          [styles.hideInSmallContainer]: hideInSmallContainer,
        })}
      >
        {children}
      </div>
    );
  }
);

export const withinDaysAgo = (date: Date, days: number): boolean => {
  const startDate = new Date();
  const day = startDate.getDate();
  const month = startDate.getMonth();
  const year = startDate.getFullYear();
  return new Date(year, month, day - days + 1) <= date;
};

export const betweenDaysAgo = (
  date: Date,
  days0: number,
  days1: number
): boolean => {
  return !withinDaysAgo(date, days0) && withinDaysAgo(date, days1);
};
