/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { canTrashMsuPack, deleteMsuPack } from '@app/storage/msu-store';
import { usePackRemoval } from '../pack-removal/usePackRemoval';
import type { MsuPackActionsParams } from './msu-manager.type';

const promptFor = (packName: string) => ({
  title: 'Delete Music Pack',
  message: `Delete pack "${packName}"? ${canTrashMsuPack() ? 'It goes to the Recycle Bin.' : 'This cannot be undone.'}`,
});

const useMsuPackActions = (params: MsuPackActionsParams) => {
  const { setSelected, refresh, packFor } = params;
  const { handleDelete, handleUninstalled } = usePackRemoval({ ...params, promptFor, deleteItem: deleteMsuPack });

  const isInstalled = useCallback((name: string) => packFor(name) !== null, [packFor]);

  const refreshThenSelect = useCallback((name: string) => {
    void refresh().then(() => setSelected(name));
  }, [refresh, setSelected]);

  return { isInstalled, refreshThenSelect, handleDelete, handleUninstalled };
};

export { useMsuPackActions };
