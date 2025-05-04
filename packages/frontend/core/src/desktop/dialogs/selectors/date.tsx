import { DatePicker, Menu } from '@affine/component';
import type { DialogComponentProps } from '@affine/core/modules/dialogs';
import type { WORKSPACE_DIALOG_SCHEMA } from '@affine/core/modules/dialogs/constant';
import { useI18n } from '@affine/i18n';
import { cssVarV2 } from '@toeverything/theme/v2';
import { useCallback, useState } from 'react';

/**
 * A global date selector popover, mainly used in blocksuite editor
 */
export const DateSelectorDialog = ({
  close,
  position,
  onSelect,
}: DialogComponentProps<WORKSPACE_DIALOG_SCHEMA['date-selector']>) => {
  const [selectedDate, setSelectedDate] = useState<string>();

  const t = useI18n();

  const onClose = useCallback(
    (open: boolean) => {
      if (!open) {
        close();
      }
    },
    [close]
  );

  const handleSelect = useCallback(
    (date?: string) => {
      setSelectedDate(date);
      onSelect?.(date);
    },
    [onSelect]
  );

  return (
    <Menu
      rootOptions={{
        modal: true,
        open: true,
        onOpenChange: onClose,
      }}
      contentOptions={{
        side: 'bottom',
        sideOffset: 8,
        align: 'start',
        style: {
          padding: 20,
          borderRadius: 8,
          background: cssVarV2('layer/background/primary'),
        },
      }}
      items={
        <DatePicker
          weekDays={t['com.affine.calendar-date-picker.week-days']()}
          monthNames={t['com.affine.calendar-date-picker.month-names']()}
          todayLabel={t['com.affine.calendar-date-picker.today']()}
          value={selectedDate}
          onChange={handleSelect}
        />
      }
    >
      {/* hack the menu positioning using the following fixed anchor */}
      <div
        style={
          position
            ? {
                position: 'fixed',
                left: position[0],
                top: position[1],
                width: position[2],
                height: position[3],
              }
            : {
                position: 'fixed',
                left: '50%',
                top: '50%',
                width: 0,
                height: 0,
              }
        }
      />
    </Menu>
  );
};
