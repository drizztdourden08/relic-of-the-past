/* @layer renderer-components @kind hook */
/** Picking, validating, and importing a raw SRAM save into this profile's sram.dat. */
import { useState, useCallback } from 'react';
import type { FilePickerPort } from '@shared/platform';
import * as savesStore from '@app/lib/storage/saves-store';
import { log } from '../../../../../../../lib/log-bus';
import type { DialogState } from './home-tab.type';
import { validSramSlots } from '@app/lib/game/save-file/sram-slots';

const SRAM_BYTES = 8192; // core/zelda3/src/zelda_rtl.c:1345, the cartridge's fixed SRAM size
const IMPORT_CONFIRM_WORD = 'import'; // typed, not the filename, so it is a deliberate action and not a memory test

const useHomeTabSramImport = (params: {
  profileId: string;
  filePicker: FilePickerPort;
  dialog: DialogState;
  setDialog: (dialog: DialogState) => void;
  showToast: (message: string) => void;
}) => {
  const { profileId, filePicker, dialog, setDialog, showToast } = params;
  const [importConfirmText, setImportConfirmText] = useState('');

  const handleImportSram = useCallback(async () => {
    const picked = await filePicker.pickFile({ extensions: ['srm', 'sav', 'dat'] });
    if (!picked) return;

    if (picked.bytes.byteLength !== SRAM_BYTES) {
      setDialog({
        type: 'import-sram-invalid',
        targetName: picked.name,
        detail: `"${picked.name}" is ${picked.bytes.byteLength} bytes. A raw SRAM save is always exactly ${SRAM_BYTES} bytes.`,
      });
      return;
    }

    const validSlots = validSramSlots(picked.bytes);
    if (validSlots.length === 0) {
      setDialog({
        type: 'import-sram-invalid',
        targetName: picked.name,
        detail: `"${picked.name}" is the right size, but none of its 3 save slots pass the game's own checksum, so this isn't a valid save file for the game.`,
      });
      return;
    }

    setImportConfirmText('');
    setDialog({
      type: 'import-sram',
      targetName: picked.name,
      pendingBytes: picked.bytes,
      detail: `Verified: ${validSlots.length} of 3 save slot(s) pass the game's checksum.`,
    });
  }, [filePicker, setDialog]);

  const handleCancelImportSram = useCallback(() => {
    setDialog({ type: null });
    setImportConfirmText('');
  }, [setDialog]);

  const handleConfirmImportSram = useCallback(async () => {
    const { pendingBytes, targetName } = dialog;
    setDialog({ type: null });
    setImportConfirmText('');
    if (!pendingBytes) return;
    await savesStore.writeSram(profileId, pendingBytes.buffer as ArrayBuffer);
    log.app(`Imported SRAM save from "${targetName}". It takes effect next time this profile loads`);
    showToast(`Save imported from "${targetName}"`);
  }, [profileId, dialog, setDialog, showToast]);

  return {
    importConfirmText, setImportConfirmText, handleImportSram, handleCancelImportSram, handleConfirmImportSram,
  };
};

export { useHomeTabSramImport, IMPORT_CONFIRM_WORD };
