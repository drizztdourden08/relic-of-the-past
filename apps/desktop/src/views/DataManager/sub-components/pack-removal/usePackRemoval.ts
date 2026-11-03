/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import type { PackRemovalParams } from './pack-removal.type';

const usePackRemoval = (params: PackRemovalParams) => {
  const { selected, setSelected, refresh, packFor, confirmUninstall, onDeleteConfirm, promptFor, deleteItem } = params;

  const forget = useCallback(async (key: string) => {
    if (selected === key) setSelected(null);
    await refresh();
  }, [selected, setSelected, refresh]);

  const handleDelete = useCallback((key: string) => {
    const owner = packFor(key);
    if (owner) {
      confirmUninstall(owner, () => { void forget(key); });
      return;
    }
    const { title, message } = promptFor(key);
    onDeleteConfirm(title, message, () => {
      void deleteItem(key).then(() => forget(key));
    });
  }, [packFor, confirmUninstall, forget, onDeleteConfirm, promptFor, deleteItem]);

  const handleUninstalled = useCallback(() => {
    if (selected !== null) void forget(selected);
  }, [selected, forget]);

  return { handleDelete, handleUninstalled };
};

export { usePackRemoval };
