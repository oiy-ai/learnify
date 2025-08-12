import { SettingHeader } from '@affine/component/setting-components';
import { useI18n } from '@affine/i18n';

import { BillingDevelopmentBanner } from './development-banner';

export const BillingSettings = () => {
  const t = useI18n();

  return (
    <>
      <SettingHeader
        title={t['com.affine.payment.billing-setting.title']()}
        subtitle={t['com.affine.payment.billing-setting.subtitle']()}
      />
      <BillingDevelopmentBanner />
    </>
  );
};
