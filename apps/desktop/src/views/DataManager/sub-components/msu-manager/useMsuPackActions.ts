/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { canTrashMsuPack, deleteMsuPack } from '@app/storage/msu-store';
import type { MsuPackActionsParams } from './msu-manager.type';

const useMsuPackActions = (params: MsuPackActionsParams) => {
  const { selected, setSelected, refresh, packFor, confirmUninstall, onDeleteConfirm } = params;

  const isInstalled = useCallback((name: string) => packFor(name) !== null, [packFor]);

  const refreshThenSelect = useCallback((name: string) => {
    void refresh().then(() => setSelected(name));
  }, [refresh, setSelected]);

  const forget = useCallback(async (packName: string) => {
    if (selected === packName) setSelected(null);
    await refresh();
  }, [selected, setSelected, refresh]);

  const handleDelete = useCallback((packName: string) => {
    const owner = packFor(packName);
    if (owner) {
      confirmUninstall(owner, () => { void forget(packName); });
      return;
    }
    const outcome = canTrashMsuPack() ? 'It goes to the Recycle Bin.' : 'This cannot be undone.';
    onDeleteConfirm('Delete Music Pack', `Delete pack "${packName}"? ${outcome}`, () => {
      void deleteMsuPack(packName).then(() => forget(packName));
    });
  }, [packFor, confirmUninstall, forget, onDeleteConfirm]);

  const handleUninstalled = useCallback(() => {
    if (selected !== null) void forget(selected);
  }, [selected, forget]);

  return { isInstalled, refreshThenSelect, handleDelete, handleUninstalled };
};

export { useMsuPackActions };
