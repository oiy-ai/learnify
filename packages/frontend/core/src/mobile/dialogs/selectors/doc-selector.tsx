import { Modal } from '@affine/component';
import type {
  DialogComponentProps,
  WORKSPACE_DIALOG_SCHEMA,
} from '@affine/core/modules/dialogs';
import { DocsService } from '@affine/core/modules/doc';
import { DocDisplayMetaService } from '@affine/core/modules/doc-display-meta';
import { useI18n } from '@affine/i18n';
import { useLiveData, useService } from '@toeverything/infra';
import { cssVarV2 } from '@toeverything/theme/v2';
import { useMemo } from 'react';

import { GenericSelector } from './generic-selector';

const DocIcon = ({ docId }: { docId: string }) => {
  const docDisplayMetaService = useService(DocDisplayMetaService);
  const Icon = useLiveData(docDisplayMetaService.icon$(docId));

  return <Icon />;
};

const DocLabel = ({ docId }: { docId: string }) => {
  const docDisplayMetaService = useService(DocDisplayMetaService);
  const label = useLiveData(docDisplayMetaService.title$(docId));
  return label;
};

export const DocSelectorDialog = ({
  close,
  init,
  onBeforeConfirm,
}: DialogComponentProps<WORKSPACE_DIALOG_SCHEMA['doc-selector']>) => {
  const t = useI18n();
  const docsService = useService(DocsService);
  const docRecords = useLiveData(docsService.list.docs$);

  const list = useMemo(() => {
    return (
      docRecords
        ?.filter(record => !record.trash$.value) // not reactive
        ?.map(record => ({
          id: record.id,
          icon: <DocIcon docId={record.id} />,
          label: <DocLabel docId={record.id} />,
        })) ?? []
    );
  }, [docRecords]);

  return (
    <Modal
      open
      onOpenChange={() => close()}
      withoutCloseButton
      fullScreen
      contentOptions={{
        style: {
          background: cssVarV2('layer/background/secondary'),
          padding: 0,
        },
      }}
    >
      <GenericSelector
        onBack={close}
        onConfirm={close}
        onBeforeConfirm={onBeforeConfirm}
        initial={init}
        data={list}
        typeName={t[`com.affine.m.selector.type-doc`]()}
      />
    </Modal>
  );
};
