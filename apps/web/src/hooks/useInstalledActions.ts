/* @layer renderer-other @kind hook */
/**
 * What an editor can do with an installed item: uninstall it, make an editable copy, or update
 * it to the store's live version. Each goes through the same store IPC the Hookshop tab uses,
 * then reloads the installed store so every lock follows. Each answers what the editor selects
 * next: the copy's name, the updated item's name, or whether the uninstall went through.
 */
import { useCallback, useState } from 'react';
import type { InstalledPack } from '@shared/store/installed-types';
import { useInstalledStore } from '@app/stores/installed-store';

const useInstalledActions = () => {
  const reload = useInstalledStore((state) => state.reload);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const begin = useCallback(() => {
    setBusy(true);
    setError(null);
  }, []);

  const finish = useCallback(async (failure: string | null) => {
    await reload();
    setBusy(false);
    setError(failure);
  }, [reload]);

  const uninstall = useCallback(async (pack: InstalledPack): Promise<boolean> => {
    begin();
    const result = await window.api.storeUninstall(pack.itemId);
    await finish(result.ok ? null : result.error);
    return result.ok;
  }, [begin, finish]);

  const duplicate = useCallback(async (pack: InstalledPack): Promise<string | null> => {
    begin();
    const result = await window.api.storeDuplicate(pack.itemId);
    await finish(result.ok ? null : result.error);
    return result.ok ? result.data.name : null;
  }, [begin, finish]);

  const update = useCallback(async (pack: InstalledPack): Promise<string | null> => {
    begin();
    const result = await window.api.storeInstall({ itemId: pack.itemId, version: null });
    // A cancelled update wrote nothing, so there is nothing to report.
    await finish(result.ok || result.cancelled ? null : result.error);
    return result.ok ? result.pack.installedName : null;
  }, [begin, finish]);

  return { busy, error, uninstall, duplicate, update };
};

type InstalledActions = ReturnType<typeof useInstalledActions>;

export { useInstalledActions };
export type { InstalledActions };
