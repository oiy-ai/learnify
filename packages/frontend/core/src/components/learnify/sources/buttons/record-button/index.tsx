import { IconButton } from '@affine/component';
import { useAsyncCallback } from '@affine/core/components/hooks/affine-async-hooks';
import { useI18n } from '@affine/i18n';
import { MicrophoneIcon, StopIcon } from '@blocksuite/icons/rc';
import clsx from 'clsx';
import type React from 'react';
import { type MouseEvent, useCallback, useRef, useState } from 'react';

import * as styles from './index.css';

interface RecordButtonProps {
  className?: string;
  style?: React.CSSProperties;
  // eslint-disable-next-line no-unused-vars
  onRecordComplete?: (audioBlob: Blob) => Promise<void> | void;
}

const sideBottom = { side: 'bottom' as const };

export function RecordButton({
  className,
  style,
  onRecordComplete,
}: RecordButtonProps) {
  const t = useI18n();
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleRecord = useAsyncCallback(
    // eslint-disable-next-line no-unused-vars
    async (e?: MouseEvent) => {
      if (isRecording) {
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
      }
    },
    [isRecording, onRecordComplete]
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
