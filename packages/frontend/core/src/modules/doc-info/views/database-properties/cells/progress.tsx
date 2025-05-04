import { Progress, PropertyValue } from '@affine/component';
import { ConfigModal } from '@affine/core/components/mobile';
import { ProgressIcon } from '@blocksuite/icons/rc';
import type { LiveData } from '@toeverything/infra';
import { useLiveData } from '@toeverything/infra';
import { useEffect, useState } from 'react';

import type { DatabaseCellRendererProps } from '../../../types';
import * as styles from './progress.css';

const DesktopProgressCell = ({
  cell,
  dataSource,
  rowId,
  onChange,
}: DatabaseCellRendererProps) => {
  const value = useLiveData(cell.value$ as LiveData<number>);
  const [localValue, setLocalValue] = useState(value || 0);

  useEffect(() => {
    setLocalValue(value || 0);
  }, [value]);

  return (
    <PropertyValue hoverable={false}>
      <Progress
        value={localValue}
        onChange={v => {
          setLocalValue(v);
        }}
        onBlur={() => {
          dataSource.cellValueChange(rowId, cell.id, localValue);
          onChange?.(localValue);
        }}
      />
    </PropertyValue>
  );
};

const MobileProgressCell = ({
  cell,
  dataSource,
  rowId,
  onChange,
}: DatabaseCellRendererProps) => {
  const value = useLiveData(cell.value$ as LiveData<number>);
  const [localValue, setLocalValue] = useState(value || 0);

  useEffect(() => {
    setLocalValue(value || 0);
  }, [value]);

  const [open, setOpen] = useState(false);
  const name = useLiveData(cell.property.name$);

  const commitChange = () => {
    dataSource.cellValueChange(rowId, cell.id, localValue);
    onChange?.(localValue);
    setOpen(false);
  };

  return (
    <>
      <PropertyValue hoverable={false} onClick={() => setOpen(true)}>
        <Progress value={value || 0} />
      </PropertyValue>

      <ConfigModal
        variant="popup"
        open={open}
        onOpenChange={setOpen}
        onDone={commitChange}
        title={
          <>
            <ProgressIcon className={styles.progressIcon} />
            {name}
          </>
        }
      >
        <Progress
          value={localValue}
          onChange={v => {
            setLocalValue(v);
          }}
        />
      </ConfigModal>
    </>
  );
};
export const ProgressCell = BUILD_CONFIG.isMobileEdition
  ? MobileProgressCell
  : DesktopProgressCell;
