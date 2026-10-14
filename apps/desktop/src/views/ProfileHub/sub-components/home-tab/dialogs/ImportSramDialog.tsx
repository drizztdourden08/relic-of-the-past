/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { Dialog } from '@drizztdourden08/tessera/composites';
import { TextInput, Text, Box, Icon } from '@drizztdourden08/tessera/primitives';
import { IMPORT_CONFIRM_WORD } from '../home-tab.constants';
import type { HomeTabDialogProps } from '../home-tab.type';

const ImportSramDialog = ({ saves }: HomeTabDialogProps) => {
  const {
    dialog, importConfirmText, setImportConfirmText, handleCancelImportSram, handleConfirmImportSram,
  } = saves;
  const confirmWordTyped = importConfirmText.trim().toLowerCase() === IMPORT_CONFIRM_WORD;

  const handleConfirmChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setImportConfirmText(e.target.value),
    [setImportConfirmText],
  );
  const handleConfirmKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' && confirmWordTyped) void handleConfirmImportSram();
  }, [confirmWordTyped, handleConfirmImportSram]);

  return (
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
        <Icon className="home-tab-dialogs__callout-icon" name="check" />
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
  );
};

export { ImportSramDialog };
