/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { Dialog } from '@drizztdourden08/tessera/composites';
import { TextInput } from '@drizztdourden08/tessera/primitives';
import { SAVE_NAME_MAX_LENGTH } from '../home-tab.constants';
import type { HomeTabDialogProps } from '../home-tab.type';

const CreateSaveDialog = ({ saves, onClose }: HomeTabDialogProps) => {
  const { dialog, newSaveName, setNewSaveName, handleConfirmCreate } = saves;
  const handleNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setNewSaveName(e.target.value), [setNewSaveName]);
  const handleNameKey = useCallback((e: KeyboardEvent) => { if (e.key === 'Enter') void handleConfirmCreate(); }, [handleConfirmCreate]);

  return (
    <Dialog
      open={dialog.type === 'create'}
      title="Create Save"
      message=""
      confirmLabel="Save"
      cancelLabel="Cancel"
      onConfirm={handleConfirmCreate}
      onCancel={onClose}
    >
      <TextInput
        className="home-tab__save-name-input"
        value={newSaveName}
        onChange={handleNameChange}
        onKeyDown={handleNameKey}
        placeholder="Save name..."
        maxLength={SAVE_NAME_MAX_LENGTH}
        autoFocus
      />
    </Dialog>
  );
};

export { CreateSaveDialog };
