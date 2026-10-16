/* @layer renderer-components @kind component */
import { Dialog } from '@drizztdourden08/tessera/composites';
import type { HomeTabDialogProps } from '../home-tab.type';

const ConfirmSaveDialogs = ({ saves, onClose }: HomeTabDialogProps) => {
  const { dialog, handleConfirmLoad, handleConfirmOverwrite, handleConfirmDelete } = saves;

  return (
    <>
      <Dialog
        open={dialog.type === 'load'}
        title="Load Save"
        message={`Load "${dialog.targetName}"? Unsaved progress is lost.`}
        confirmLabel="Load"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmLoad}
        onCancel={onClose}
      />

      <Dialog
        open={dialog.type === 'overwrite'}
        title="Overwrite Save"
        message={`Overwrite "${dialog.targetName}" with the current game?`}
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
