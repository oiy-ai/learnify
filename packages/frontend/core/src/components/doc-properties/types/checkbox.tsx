import { Checkbox, PropertyValue } from '@affine/component';
import { useCallback } from 'react';

import * as styles from './checkbox.css';
import type { PropertyValueProps } from './types';

export const CheckboxValue = ({
  value,
  onChange,
  readonly,
}: PropertyValueProps) => {
  const parsedValue = value === 'true' ? true : false;
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (readonly) {
        return;
      }
      onChange(parsedValue ? 'false' : 'true');
    },
    [onChange, parsedValue, readonly]
  );
  return (
    <PropertyValue onClick={handleClick} className={styles.container}>
      <Checkbox
        className={styles.checkboxProperty}
        checked={parsedValue}
        onChange={() => {}}
        disabled={readonly}
      />
    </PropertyValue>
  );
};
