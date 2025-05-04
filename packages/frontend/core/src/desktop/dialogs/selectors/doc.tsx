import { Modal } from '@affine/component';
import { SelectPage } from '@affine/core/components/page-list/docs/select-page';
import type {
  DialogComponentProps,
  WORKSPACE_DIALOG_SCHEMA,
} from '@affine/core/modules/dialogs';
import { cssVar } from '@toeverything/theme';

export const DocSelectorDialog = ({
  close,
  init: selectedDocIds,
}: DialogComponentProps<WORKSPACE_DIALOG_SCHEMA['doc-selector']>) => {
  return (
    <Modal
      open
      onOpenChange={() => close()}
      withoutCloseButton
      width="calc(100% - 32px)"
      height="80%"
      contentOptions={{
        style: {
          padding: 0,
          maxWidth: 976,
          background: cssVar('backgroundPrimaryColor'),
        },
      }}
    >
      <SelectPage
        init={selectedDocIds}
        onCancel={() => close()}
        onConfirm={value => close(value)}
      />
    </Modal>
  );
};
