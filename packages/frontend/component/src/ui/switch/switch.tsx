// components/switch.tsx
import { assignInlineVars } from '@vanilla-extract/dynamic';
import clsx from 'clsx';
import type { HTMLAttributes, ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';

import * as styles from './index.css';

export type SwitchProps = Omit<HTMLAttributes<HTMLLabelElement>, 'onChange'> & {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  children?: ReactNode;
  disabled?: boolean;
  /**
   * The height of the switch (including the padding)
   */
  size?: number;
  /**
   * The padding of the switch
   */
  padding?: number;
};

export const Switch = ({
  checked: checkedProp = false,
  onChange: onChangeProp,
  children,
  className,
  disabled,
  style,
  size: propsSize,
  padding: propsPadding,
  ...otherProps
}: SwitchProps) => {
  const size = propsSize ?? (BUILD_CONFIG.isMobileEdition ? 24 : 26);
  const padding = propsPadding ?? (BUILD_CONFIG.isMobileEdition ? 2 : 3);
  const [checkedState, setCheckedState] = useState(checkedProp);

  const checked = onChangeProp ? checkedProp : checkedState;
  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) {
        return;
      }
      const newChecked = event.target.checked;
      if (onChangeProp) onChangeProp(newChecked);
      else setCheckedState(newChecked);
    },
    [disabled, onChangeProp]
  );

  const labelStyle = useMemo(
    () => ({
      ...assignInlineVars({
        [styles.switchHeightVar]: `${size}px`,
        [styles.switchPaddingVar]: `${padding}px`,
      }),
      ...style,
    }),
    [size, padding, style]
  );

  return (
    <label
      className={clsx(styles.labelStyle, className)}
      style={labelStyle}
      {...otherProps}
    >
      {children}
      <input
        className={clsx(styles.inputStyle)}
        type="checkbox"
        value={checked ? 'on' : 'off'}
        checked={checked}
        onChange={onChange}
      />
      <span
        className={clsx(styles.switchStyle, {
          [styles.switchCheckedStyle]: checked,
          [styles.switchDisabledStyle]: disabled,
        })}
      />
    </label>
  );
};
