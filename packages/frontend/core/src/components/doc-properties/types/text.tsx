import { PropertyValue } from '@affine/component';
import { useI18n } from '@affine/i18n';
import { TextIcon } from '@blocksuite/icons/rc';
import {
  type ChangeEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { ConfigModal } from '../../mobile';
import * as styles from './text.css';
import type { PropertyValueProps } from './types';

const DesktopTextValue = ({
  value,
  onChange,
  readonly,
}: PropertyValueProps) => {
  const [tempValue, setTempValue] = useState<string>(value);
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);
  const ref = useRef<HTMLTextAreaElement>(null);
  const handleBlur = useCallback(
    (e: FocusEvent) => {
      onChange((e.currentTarget as HTMLTextAreaElement).value.trim());
    },
    [onChange]
  );
  // use native blur event to get event after unmount
  // don't use useLayoutEffect here, cause the cleanup function will be called before unmount
  useEffect(() => {
    ref.current?.addEventListener('blur', handleBlur);
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ref.current?.removeEventListener('blur', handleBlur);
    };
  }, [handleBlur]);
  const handleOnChange: ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    e => {
      setTempValue(e.target.value);
    },
    []
  );
  const t = useI18n();
  useEffect(() => {
    setTempValue(value);
  }, [value]);

  return (
    <PropertyValue
      className={styles.textPropertyValueContainer}
      onClick={handleClick}
      isEmpty={!value}
      readonly={readonly}
    >
      <textarea
        ref={ref}
        className={styles.textarea}
        value={tempValue || ''}
        onChange={handleOnChange}
        onClick={handleClick}
        data-empty={!tempValue}
        autoFocus={false}
        placeholder={t[
          'com.affine.page-properties.property-value-placeholder'
        ]()}
        disabled={readonly}
      />
      <div className={styles.textInvisible}>
        {tempValue}
        {tempValue?.endsWith('\n') || !tempValue ? <br /> : null}
      </div>
    </PropertyValue>
  );
};

const MobileTextValue = ({
  value,
  onChange,
  propertyInfo,
}: PropertyValueProps) => {
  const [open, setOpen] = useState(false);

  const [tempValue, setTempValue] = useState<string>(value || '');
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(true);
  }, []);
  const ref = useRef<HTMLTextAreaElement>(null);
  const handleBlur = useCallback(
    (e: FocusEvent) => {
      onChange((e.currentTarget as HTMLTextAreaElement).value.trim());
    },
    [onChange]
  );
  // use native blur event to get event after unmount
  // don't use useLayoutEffect here, cause the cleanup function will be called before unmount
  useEffect(() => {
    ref.current?.addEventListener('blur', handleBlur);
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ref.current?.removeEventListener('blur', handleBlur);
    };
  }, [handleBlur]);
  const handleOnChange: ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    e => {
      setTempValue(e.target.value);
    },
    []
  );
  const onClose = useCallback(() => {
    setOpen(false);
    onChange(tempValue.trim());
  }, [onChange, tempValue]);
  const t = useI18n();
  useEffect(() => {
    setTempValue(value || '');
  }, [value]);

  return (
    <>
      <PropertyValue
        className={styles.textPropertyValueContainer}
        onClick={handleClick}
        isEmpty={!value}
      >
        <div className={styles.mobileTextareaPlain} data-empty={!tempValue}>
          {tempValue ||
            t['com.affine.page-properties.property-value-placeholder']()}
        </div>
      </PropertyValue>
      <ConfigModal
        open={open}
        onOpenChange={setOpen}
        onBack={onClose}
        title={
          <>
            <TextIcon />
            {propertyInfo?.name}
          </>
        }
      >
        <div className={styles.mobileTextareaWrapper}>
          <textarea
            ref={ref}
            className={styles.mobileTextarea}
            value={tempValue || ''}
            onChange={handleOnChange}
            data-empty={!tempValue}
            autoFocus
            placeholder={t[
              'com.affine.page-properties.property-value-placeholder'
            ]()}
          />
          <div className={styles.mobileTextInvisible}>
            {tempValue}
            {tempValue?.endsWith('\n') || !tempValue ? <br /> : null}
          </div>
        </div>
      </ConfigModal>
    </>
  );
};

export const TextValue = BUILD_CONFIG.isMobileWeb
  ? MobileTextValue
  : DesktopTextValue;
