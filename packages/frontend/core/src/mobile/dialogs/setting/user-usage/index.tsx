import { Skeleton } from '@affine/component';
import {
  AuthService,
  ServerService,
  UserCopilotQuotaService,
  UserQuotaService,
} from '@affine/core/modules/cloud';
import { useLiveData, useService } from '@toeverything/infra';
import { cssVar } from '@toeverything/theme';
import { cssVarV2 } from '@toeverything/theme/v2';
import { type ReactNode, useEffect } from 'react';

import { SettingGroup } from '../group';
import * as styles from './style.css';

export const UserUsage = () => {
  const session = useService(AuthService).session;
  const loginStatus = useLiveData(session.status$);

  if (loginStatus !== 'authenticated') {
    return null;
  }

  return <UsagePanel />;
};

const Progress = ({
  name,
  percent,
  desc,
  color,
  children,
}: {
  name: ReactNode;
  desc: ReactNode;
  percent?: number;
  color?: string | null;
  children?: React.ReactNode;
}) => {
  return (
    <div className={styles.progressRoot}>
      <div className={styles.progressInfoRow}>
        <span className={styles.progressName}>{name}</span>
        <span className={styles.progressDesc}>{desc}</span>
      </div>
      {children ?? (
        <div className={styles.progressTrack}>
          <div
            className={styles.progressBar}
            style={{
              width: `${percent}%`,
              backgroundColor: color ?? cssVarV2('button/primary'),
            }}
          />
        </div>
      )}
    </div>
  );
};

const skeletonProps = { style: { margin: 0 }, animation: 'wave' } as const;
const Loading = () => {
  return (
    <Progress
      name={<Skeleton height={22} width="60" {...skeletonProps} />}
      desc={<Skeleton height={16} width="80" {...skeletonProps} />}
    >
      <Skeleton height={10} {...skeletonProps} />
    </Progress>
  );
};

const UsagePanel = () => {
  const serverService = useService(ServerService);
  const serverFeatures = useLiveData(serverService.server.features$);

  return (
    <SettingGroup title="Storage" contentStyle={{ padding: '10px 16px' }}>
      <CloudUsage />
      {serverFeatures?.copilot ? <AiUsage /> : null}
    </SettingGroup>
  );
};

const CloudUsage = () => {
  const quota = useService(UserQuotaService).quota;

  const color = useLiveData(quota.color$);
  const usedFormatted = useLiveData(quota.usedFormatted$);
  const maxFormatted = useLiveData(quota.maxFormatted$);
  const percent = useLiveData(quota.percent$);

  useEffect(() => {
    // revalidate quota to get the latest status
    quota.revalidate();
  }, [quota]);

  const loading = percent === null;

  if (loading) return <Loading />;

  return (
    <Progress
      name="Cloud"
      percent={percent}
      desc={`${usedFormatted}/${maxFormatted}`}
      color={color}
    />
  );
};
const AiUsage = () => {
  const copilotQuotaService = useService(UserCopilotQuotaService);

  const copilotActionLimit = useLiveData(
    copilotQuotaService.copilotQuota.copilotActionLimit$
  );
  const copilotActionUsed = useLiveData(
    copilotQuotaService.copilotQuota.copilotActionUsed$
  );
  const loading = copilotActionLimit === null || copilotActionUsed === null;
  const loadError = useLiveData(copilotQuotaService.copilotQuota.error$);

  useEffect(() => {
    copilotQuotaService.copilotQuota.revalidate();
  }, [copilotQuotaService]);

  if (loading || loadError) {
    return <Loading />;
  }

  if (copilotActionLimit === 'unlimited') {
    return null;
  }

  const percent = Math.min(
    100,
    Math.max(
      0.5,
      Number(((copilotActionUsed / copilotActionLimit) * 100).toFixed(4))
    )
  );

  const color = percent > 80 ? cssVar('errorColor') : cssVar('processingColor');

  return (
    <Progress
      name="AI"
      percent={percent}
      desc={`${copilotActionUsed}/${copilotActionLimit}`}
      color={color}
    />
  );
};
