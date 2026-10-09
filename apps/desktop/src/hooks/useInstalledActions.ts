/* @layer renderer-other @kind hook */
import { appApi } from '@app/ipc/app-api';
import { useCallback, useState } from 'react';
import type { InstalledPack } from '@shared/store/installed-types';
import { useInstalledStore } from '@app/stores/installed-store';
import type { InstalledActions } from './use-installed-actions.type';

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
    const result = await appApi().storeUninstall(pack.itemId);
    await finish(result.ok ? null : result.error);
    return result.ok;
  }, [begin, finish]);

  const duplicate = useCallback(async (pack: InstalledPack): Promise<string | null> => {
    begin();
    const result = await appApi().storeDuplicate(pack.itemId);
    await finish(result.ok ? null : result.error);
    return result.ok ? result.data.name : null;
  }, [begin, finish]);

  const update = useCallback(async (pack: InstalledPack): Promise<string | null> => {
    begin();
    const result = await appApi().storeInstall({ itemId: pack.itemId, version: null });
    const wroteNothing = result.ok || result.cancelled;
    await finish(wroteNothing ? null : result.error);
    return result.ok ? result.pack.installedName : null;
  }, [begin, finish]);

  return { busy, error, uninstall, duplicate, update };
};

export { useInstalledActions };
export type { InstalledActions };
