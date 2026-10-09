/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { Dialog } from '@drizztdourden08/tessera/composites';
import { TextInput, Text, Box } from '@drizztdourden08/tessera/primitives';
import { IMPORT_CONFIRM_WORD, SAVE_NAME_MAX_LENGTH } from './home-tab.constants';
import type { HomeTabDialogsProps } from './home-tab.type';
import './HomeTabDialogs.css';

const HomeTabDialogs = ({ saves }: HomeTabDialogsProps) => {
  const {
    dialog, setDialog, newSaveName, setNewSaveName, importConfirmText, setImportConfirmText,
    handleConfirmCreate, handleConfirmOverwrite, handleConfirmDelete,
    handleCancelImportSram, handleConfirmImportSram,
  } = saves;
  const confirmWordTyped = importConfirmText.trim().toLowerCase() === IMPORT_CONFIRM_WORD;

  const closeDialog = useCallback(() => setDialog({ type: null }), [setDialog]);
  const handleNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setNewSaveName(e.target.value), [setNewSaveName]);
  const handleNameKey = useCallback((e: KeyboardEvent) => { if (e.key === 'Enter') handleConfirmCreate(); }, [handleConfirmCreate]);
  const handleConfirmChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setImportConfirmText(e.target.value),
    [setImportConfirmText],
  );
  const handleConfirmKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' && confirmWordTyped) handleConfirmImportSram();
  }, [confirmWordTyped, handleConfirmImportSram]);

  return (
    <>
      <Dialog
        open={dialog.type === 'create'}
        title="Create Save"
        message=""
        confirmLabel="Save"
        cancelLabel="Cancel"
        onConfirm={handleConfirmCreate}
        onCancel={closeDialog}
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

      <Dialog
        open={dialog.type === 'overwrite'}
        title="Overwrite Save"
        message={`Overwrite "${dialog.targetName}"? This cannot be undone.`}
        confirmLabel="Overwrite"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmOverwrite}
        onCancel={closeDialog}
      />

      <Dialog
        open={dialog.type === 'delete'}
        title="Delete Save"
        message={`Delete "${dialog.targetName}"? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={closeDialog}
      />

      <Dialog
        open={dialog.type === 'import-sram'}
        title="Import Save"
        message=""
        confirmLabel="Import"
        cancelLabel="Cancel"
        confirmDisabled={!confirmWordTyped}
        variant="danger"
        onConfirm={handleConfirmImportSram}
        onCancel={handleCancelImportSram}
      >
        <Box className="home-tab-dialogs__callout home-tab-dialogs__callout--ok">
          <Text as="span" className="home-tab-dialogs__callout-icon">✓</Text>
          <Text as="span">{dialog.detail}</Text>
        </Box>
        <Text as="p" className="home-tab-dialogs__warning">
          Replace this profile's save with <Text as="strong">"{dialog.targetName}"</Text>? The current
          in-game save is overwritten and this cannot be undone.
        </Text>
        <Text as="p" className="home-tab-dialogs__hint">
          Type <Text as="code" className="home-tab-dialogs__confirm-word">{IMPORT_CONFIRM_WORD}</Text> to confirm.
        </Text>
        <TextInput
          className="home-tab__import-confirm-input"
          value={importConfirmText}
          onChange={handleConfirmChange}
          onKeyDown={handleConfirmKey}
          placeholder={IMPORT_CONFIRM_WORD}
          autoFocus
        />
      </Dialog>

      <Dialog
        open={dialog.type === 'import-sram-invalid'}
        title="Not a Valid Save"
        message=""
        confirmLabel="OK"
        hideCancel
        onConfirm={closeDialog}
        onCancel={closeDialog}
      >
        <Box className="home-tab-dialogs__callout home-tab-dialogs__callout--bad">
          <Text as="span" className="home-tab-dialogs__callout-icon">⚠</Text>
          <Text as="span">{dialog.detail ?? 'That file is not a valid ALttP SRAM save.'}</Text>
        </Box>
      </Dialog>
    </>
  );
};

export { HomeTabDialogs };
