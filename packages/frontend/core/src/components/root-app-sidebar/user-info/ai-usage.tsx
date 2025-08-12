import {
  SubscriptionService,
  UserCopilotQuotaService,
} from '@affine/core/modules/cloud';
import { toast } from '@affine/core/utils';
import { useI18n } from '@affine/i18n';
import { useLiveData, useService } from '@toeverything/infra';
import { cssVar } from '@toeverything/theme';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import clsx from 'clsx';
import { useCallback, useEffect } from 'react';

import * as styles from './index.css';

export const AIUsage = () => {
  const t = useI18n();
  const copilotQuotaService = useService(UserCopilotQuotaService);
  const subscriptionService = useService(SubscriptionService);

  useEffect(() => {
    // revalidate latest subscription status
    subscriptionService.subscription.revalidate();
  }, [subscriptionService]);
  useEffect(() => {
    copilotQuotaService.copilotQuota.revalidate();
  }, [copilotQuotaService]);

  const copilotActionLimit = useLiveData(
    copilotQuotaService.copilotQuota.copilotActionLimit$
  );
  const copilotActionUsed = useLiveData(
    copilotQuotaService.copilotQuota.copilotActionUsed$
  );
  const loading = copilotActionLimit === null || copilotActionUsed === null;
  const loadError = useLiveData(copilotQuotaService.copilotQuota.error$);

  const handleAIUsageClick = useCallback(() => {
    toast(t['com.affine.payment.feature-under-development']());
  }, [t]);

  if (loading) {
    if (loadError) console.error(loadError);
    return null;
  }

  // unlimited
  if (copilotActionLimit === 'unlimited') {
    return (
      <div
        onClick={handleAIUsageClick}
        data-pro
        className={clsx(styles.usageBlock, styles.aiUsageBlock)}
      >
        <div className={styles.usageLabel}>
          <div className={styles.usageLabelTitle}>
            {t['com.affine.user-info.usage.ai']()}
          </div>
        </div>
        <div className={styles.usageLabel}>
          {t['com.affine.payment.ai.usage-description-purchased']()}
        </div>
      </div>
    );
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
    <div
      onClick={handleAIUsageClick}
      className={clsx(styles.usageBlock, styles.aiUsageBlock)}
      style={assignInlineVars({
        [styles.progressColorVar]: color,
      })}
    >
      <div className={styles.usageLabel}>
        <div>
          <span className={styles.usageLabelTitle}>
            {t['com.affine.user-info.usage.ai']()}
          </span>
          <span>{copilotActionUsed}</span>
          <span>&nbsp;/&nbsp;</span>
          <span>{copilotActionLimit}</span>
        </div>

        <div className={styles.freeTag}>Free</div>
      </div>

      <div className={styles.cloudUsageBar}>
        <div
          className={styles.cloudUsageBarInner}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
