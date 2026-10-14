/* @layer renderer-components @kind component */
import { Dialog } from '@drizztdourden08/tessera/composites';
import type { HomeTabDialogProps } from '../home-tab.type';

const ConfirmSaveDialogs = ({ saves, onClose }: HomeTabDialogProps) => {
  const { dialog, handleConfirmOverwrite, handleConfirmDelete } = saves;

  return (
    <>
      <Dialog
        open={dialog.type === 'overwrite'}
        title="Overwrite Save"
        message={`Overwrite "${dialog.targetName}"? This cannot be undone.`}
        confirmLabel="Overwrite"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmOverwrite}
        onCancel={onClose}
      />

      <Dialog
        open={dialog.type === 'delete'}
        title="Delete Save"
        message={`Delete "${dialog.targetName}"? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={onClose}
      />
    </>
  );
};

export { ConfirmSaveDialogs };
