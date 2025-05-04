import {
  IconButton,
  Menu,
  MenuItem,
  MenuTrigger,
  Switch,
  useConfirmModal,
} from '@affine/component';
import {
  SettingHeader,
  SettingRow,
  SettingWrapper,
} from '@affine/component/setting-components';
import { useAsyncCallback } from '@affine/core/components/hooks/affine-async-hooks';
import { MeetingSettingsService } from '@affine/core/modules/media/services/meeting-settings';
import type { MeetingSettingsSchema } from '@affine/electron/main/shared-state-schema';
import { Trans, useI18n } from '@affine/i18n';
import track from '@affine/track';
import {
  ArrowRightSmallIcon,
  DoneIcon,
  InformationFillDuotoneIcon,
} from '@blocksuite/icons/rc';
import { useLiveData, useService } from '@toeverything/infra';
import { useCallback, useEffect, useMemo, useState } from 'react';

import * as styles from './styles.css';

const RecordingModes: MeetingSettingsSchema['recordingMode'][] = [
  'prompt',
  'auto-start',
  'none',
];

const RecordingModeMenu = () => {
  const meetingSettingsService = useService(MeetingSettingsService);
  const settings = useLiveData(meetingSettingsService.settings$);
  const t = useI18n();

  const options = useMemo(() => {
    return RecordingModes.map(mode => ({
      label: t[`com.affine.settings.meetings.record.recording-mode.${mode}`](),
      value: mode,
    }));
  }, [t]);

  const currentMode = settings.recordingMode;

  const handleRecordingModeChange = useCallback(
    (mode: MeetingSettingsSchema['recordingMode']) => {
      meetingSettingsService.setRecordingMode(mode);
    },
    [meetingSettingsService]
  );

  return (
    <Menu
      items={options.map(option => {
        return (
          <MenuItem
            key={option.value}
            title={option.label}
            onSelect={() => handleRecordingModeChange(option.value)}
            data-selected={currentMode === option.value}
          >
            {option.label}
          </MenuItem>
        );
      })}
    >
      <MenuTrigger style={{ fontWeight: 600, width: '250px' }} block={true}>
        {options.find(option => option.value === currentMode)?.label}
      </MenuTrigger>
    </Menu>
  );
};

// Add the PermissionSettingRow component
interface PermissionSettingRowProps {
  nameKey: string;
  descriptionKey: string;
  permissionSettingKey: string;
  hasPermission: boolean;
  onOpenPermissionSetting: () => void | Promise<void>;
}

const PermissionSettingRow = ({
  nameKey,
  descriptionKey,
  permissionSettingKey,
  hasPermission,
  onOpenPermissionSetting,
}: PermissionSettingRowProps) => {
  const t = useI18n();

  const handleClick = () => {
    const result = onOpenPermissionSetting();
    if (result instanceof Promise) {
      result.catch(error => {
        console.error('Error opening permission setting:', error);
      });
    }
  };

  return (
    <SettingRow
      name={t[nameKey]()}
      desc={
        <>
          {t[descriptionKey]()}
          {!hasPermission && (
            <span onClick={handleClick} className={styles.permissionSetting}>
              {t[permissionSettingKey]()}
            </span>
          )}
        </>
      }
    >
      <IconButton
        icon={
          hasPermission ? (
            <DoneIcon />
          ) : (
            <InformationFillDuotoneIcon className={styles.noPermissionIcon} />
          )
        }
        onClick={handleClick}
      />
    </SettingRow>
  );
};

export const MeetingsSettings = () => {
  const t = useI18n();
  const meetingSettingsService = useService(MeetingSettingsService);
  const settings = useLiveData(meetingSettingsService.settings$);
  const [recordingFeatureAvailable, setRecordingFeatureAvailable] =
    useState(false);

  const [permissions, setPermissions] = useState<{
    screen: boolean;
    microphone: boolean;
  }>();

  const confirmModal = useConfirmModal();

  useEffect(() => {
    meetingSettingsService
      .isRecordingFeatureAvailable()
      .then(available => {
        setRecordingFeatureAvailable(available ?? false);
      })
      .catch(() => {
        setRecordingFeatureAvailable(false);
      });
    meetingSettingsService
      .checkMeetingPermissions()
      .then(permission => {
        setPermissions(permission);
      })
      .catch(err => console.log(err));
  }, [meetingSettingsService]);

  const handleEnabledChange = useAsyncCallback(
    async (checked: boolean) => {
      try {
        track.$.settingsPanel.meetings.toggleMeetingFeatureFlag({
          option: checked ? 'on' : 'off',
          type: 'Meeting record',
        });
        await meetingSettingsService.setEnabled(checked);
      } catch {
        confirmModal.openConfirmModal({
          title:
            t['com.affine.settings.meetings.record.permission-modal.title'](),
          description:
            t[
              'com.affine.settings.meetings.record.permission-modal.description'
            ](),
          onConfirm: async () => {
            await meetingSettingsService.showRecordingPermissionSetting(
              'screen'
            );
          },
          cancelText: t['com.affine.recording.dismiss'](),
          confirmButtonOptions: {
            variant: 'primary',
          },
          confirmText:
            t[
              'com.affine.settings.meetings.record.permission-modal.open-setting'
            ](),
        });
      }
    },
    [confirmModal, meetingSettingsService, t]
  );

  const handleAutoTranscriptionChange = useCallback(
    (checked: boolean) => {
      meetingSettingsService.setAutoTranscription(checked);
    },
    [meetingSettingsService]
  );

  const handleOpenScreenRecordingPermissionSetting =
    useAsyncCallback(async () => {
      await meetingSettingsService.showRecordingPermissionSetting('screen');
    }, [meetingSettingsService]);

  const handleOpenMicrophoneRecordingPermissionSetting =
    useAsyncCallback(async () => {
      const result =
        await meetingSettingsService.askForMeetingPermission('microphone');
      if (!result) {
        await meetingSettingsService.showRecordingPermissionSetting(
          'microphone'
        );
      }
    }, [meetingSettingsService]);

  const handleOpenSavedRecordings = useAsyncCallback(async () => {
    await meetingSettingsService.openSavedRecordings();
  }, [meetingSettingsService]);

  return (
    <div className={styles.meetingWrapper}>
      <SettingHeader title={t['com.affine.settings.meetings']()} />

      <SettingRow
        name={t['com.affine.settings.meetings.enable.title']()}
        desc={
          <Trans
            i18nKey="com.affine.settings.meetings.enable.description"
            components={{
              1: (
                <a
                  className={styles.link}
                  href="https://discord.com/channels/959027316334407691/1358384103925350542"
                  target="_blank"
                  rel="noreferrer"
                />
              ),
            }}
          />
        }
      >
        <Switch
          checked={settings.enabled}
          onChange={handleEnabledChange}
          data-testid="meetings-enable-switch"
        />
      </SettingRow>

      {recordingFeatureAvailable && (
        <>
          <SettingWrapper
            disabled={!settings.enabled}
            title={t['com.affine.settings.meetings.record.header']()}
          >
            <SettingRow
              name={t['com.affine.settings.meetings.record.recording-mode']()}
              desc={t[
                'com.affine.settings.meetings.record.recording-mode.description'
              ]()}
            >
              <RecordingModeMenu />
            </SettingRow>
            <SettingRow
              name={t['com.affine.settings.meetings.record.open-saved-file']()}
              desc={t[
                'com.affine.settings.meetings.record.open-saved-file.description'
              ]()}
            >
              <IconButton
                icon={<ArrowRightSmallIcon />}
                onClick={handleOpenSavedRecordings}
              />
            </SettingRow>
          </SettingWrapper>
          <SettingWrapper
            disabled={!settings.enabled}
            title={t['com.affine.settings.meetings.transcription.header']()}
          >
            <SettingRow
              name={t[
                'com.affine.settings.meetings.transcription.auto-transcription'
              ]()}
              desc={t[
                'com.affine.settings.meetings.transcription.auto-transcription.description'
              ]()}
            >
              <Switch
                checked={settings.autoTranscription}
                onChange={handleAutoTranscriptionChange}
                data-testid="meetings-auto-transcription-switch"
              />
            </SettingRow>
          </SettingWrapper>
          <SettingWrapper
            title={t['com.affine.settings.meetings.privacy.header']()}
          >
            <PermissionSettingRow
              nameKey="com.affine.settings.meetings.privacy.screen-system-audio-recording"
              descriptionKey="com.affine.settings.meetings.privacy.screen-system-audio-recording.description"
              permissionSettingKey="com.affine.settings.meetings.privacy.screen-system-audio-recording.permission-setting"
              hasPermission={permissions?.screen || false}
              onOpenPermissionSetting={
                handleOpenScreenRecordingPermissionSetting
              }
            />
            <PermissionSettingRow
              nameKey="com.affine.settings.meetings.privacy.microphone"
              descriptionKey="com.affine.settings.meetings.privacy.microphone.description"
              permissionSettingKey="com.affine.settings.meetings.privacy.microphone.permission-setting"
              hasPermission={permissions?.microphone || false}
              onOpenPermissionSetting={
                handleOpenMicrophoneRecordingPermissionSetting
              }
            />
          </SettingWrapper>
        </>
      )}
    </div>
  );
};
