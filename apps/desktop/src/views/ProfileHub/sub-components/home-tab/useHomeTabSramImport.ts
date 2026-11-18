/* @layer renderer-components @kind hook */
import { useState, useCallback } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import * as savesStore from '@app/storage/saves-store';
import { log } from '../../../../log-bus';
import { validSramSlots } from '@rotp/game-core';
import { toast } from '@drizztdourden08/tessera/composites';
import { SRAM_BYTES, SRAM_EXTENSIONS, TOAST_DURATION_MS } from './home-tab.constants';
import type { UseHomeTabSramImportParams } from './home-tab.type';

const useHomeTabSramImport = (params: UseHomeTabSramImportParams) => {
  const { profileId, filePicker, dialog, setDialog } = params;
  const t = useT();
  const [importConfirmText, setImportConfirmText] = useState('');

  const handleImportSram = useCallback(async () => {
    const picked = await filePicker.pickFile({ extensions: SRAM_EXTENSIONS, anyType: 'mobile' });
    if (!picked) return;

    if (picked.bytes.byteLength !== SRAM_BYTES) {
      setDialog({
        type: 'import-sram-invalid',
        targetName: picked.name,
        detail: t('profiles:home.import.wrong-size', { name: picked.name, bytes: picked.bytes.byteLength, expected: SRAM_BYTES }),
      });
      return;
    }

    const validSlots = validSramSlots(picked.bytes);
    if (validSlots.length === 0) {
      setDialog({
        type: 'import-sram-invalid',
        targetName: picked.name,
        detail: t('profiles:home.import.bad-checksum', { name: picked.name }),
      });
      return;
    }

    setImportConfirmText('');
    setDialog({
      type: 'import-sram',
      targetName: picked.name,
      pendingBytes: picked.bytes,
      detail: t('profiles:home.import.verified', { count: validSlots.length }),
    });
  }, [filePicker, setDialog, t]);

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
    toast({ message: t('profiles:home.import.done', { name: targetName ?? '' }), variant: 'success', duration: TOAST_DURATION_MS });
  }, [profileId, dialog, setDialog, t]);

  return {
    importConfirmText, setImportConfirmText, handleImportSram, handleCancelImportSram, handleConfirmImportSram,
  };
};

export { useHomeTabSramImport };
