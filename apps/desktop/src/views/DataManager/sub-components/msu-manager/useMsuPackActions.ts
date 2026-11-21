/* @layer renderer-components @kind hook */
import { useT } from '@drizztdourden08/brock-react';
import { useCallback } from 'react';
import { canTrashMsuPack, deleteMsuPack } from '@app/storage/msu-store';
import { usePackRemoval } from '../pack-removal/usePackRemoval';
import type { MsuPackActionsParams } from './msu-manager.type';

const useMsuPackActions = (params: MsuPackActionsParams) => {
  const { setSelected, refresh, packFor } = params;
  const t = useT();
  const promptFor = (packName: string) => ({
    title: t('data-manager:msu-manager.delete-title'),
    message: canTrashMsuPack()
      ? t('data-manager:msu-manager.delete-recycle', { name: packName })
      : t('data-manager:msu-manager.delete-permanent', { name: packName }),
  });
  const { handleDelete, handleUninstalled } = usePackRemoval({ ...params, promptFor, deleteItem: deleteMsuPack });

  const isInstalled = useCallback((name: string) => packFor(name) !== null, [packFor]);

  const refreshThenSelect = useCallback((name: string) => {
    void refresh().then(() => setSelected(name));
  }, [refresh, setSelected]);

  return { isInstalled, refreshThenSelect, handleDelete, handleUninstalled };
};

export { useMsuPackActions };
