/* @layer renderer-components @kind hook */
import { useState, useCallback } from 'react';
import * as savesStore from '@app/lib/storage/saves-store';
import { log } from '../../../../../../../lib/log-bus';
import { validSramSlots } from '@app/lib/game/save-file/sram-slots';
import { SRAM_BYTES, SRAM_EXTENSIONS } from './home-tab.constants';
import type { UseHomeTabSramImportParams } from './home-tab.type';

const useHomeTabSramImport = (params: UseHomeTabSramImportParams) => {
  const { profileId, filePicker, dialog, setDialog, showToast } = params;
  const [importConfirmText, setImportConfirmText] = useState('');

  const handleImportSram = useCallback(async () => {
    const picked = await filePicker.pickFile({ extensions: SRAM_EXTENSIONS });
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

export { useHomeTabSramImport };
