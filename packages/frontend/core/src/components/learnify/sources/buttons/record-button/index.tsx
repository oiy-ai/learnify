import { IconButton, notify } from '@affine/component';
import { useAsyncCallback } from '@affine/core/components/hooks/affine-async-hooks';
import { useI18n } from '@affine/i18n';
import { MicrophoneIcon, StopIcon } from '@blocksuite/icons/rc';
import clsx from 'clsx';
import type React from 'react';
import { type MouseEvent, useCallback, useState } from 'react';

import * as styles from './index.css';

interface RecordButtonProps {
  className?: string;
  style?: React.CSSProperties;
  onRecordComplete?: (audioBlob: Blob) => Promise<void> | void;
}

const sideBottom = { side: 'bottom' as const };

export function RecordButton({ className, style }: RecordButtonProps) {
  const t = useI18n();
  const [isRecording] = useState(false);
  // Unused variables commented out for future implementation
  // const [isRecording, setIsRecording] = useState(false);
  // const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // const audioChunksRef = useRef<Blob[]>([]);

  const handleRecord = useAsyncCallback(
    async (_e?: MouseEvent) => {
      // Show "功能开发中" notification
      notify({
        title: '功能开发中',
        message: '语音录制功能正在开发中，敬请期待',
      });
      return;

      // Original recording logic (currently disabled)
      /* if (isRecording) {
        // 停止录音
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
        }
      } else {
        // 开始录音
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };

          mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, {
              type: 'audio/wav',
            });
            await onRecordComplete?.(audioBlob);

            // 清理资源
            stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            mediaRecorderRef.current = null;
          };

          mediaRecorder.start();
          setIsRecording(true);
          // TODO: Add appropriate tracking for recording start
        } catch {
          alert('无法访问麦克风，请检查权限设置');
        }
      } */
    },
    [] // No dependencies needed for now since we're just showing a notification
  );

  const onClickRecord = useCallback(
    (e?: MouseEvent) => {
      handleRecord(e);
    },
    [handleRecord]
  );

  return (
    <IconButton
      tooltip={
        isRecording
          ? t['Stop Recording']?.() || '停止录音'
          : t['Start Recording']?.() || '开始录音'
      }
      tooltipOptions={sideBottom}
      data-testid="sidebar-record-button"
      style={style}
      className={clsx([styles.root, className])}
      size={16}
      onClick={onClickRecord}
      onAuxClick={onClickRecord}
    >
      {isRecording ? <StopIcon /> : <MicrophoneIcon />}
    </IconButton>
  );
}
