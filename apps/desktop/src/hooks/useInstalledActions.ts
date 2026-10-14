/* @layer renderer-other @kind hook */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { useCallback, useState } from 'react';
import { catalogApi, useCatalogInstalled } from '@drizztdourden08/brock-catalog/renderer';
import type { InstalledPack } from '@rotp/hub-contracts';
import { NO_CATALOG } from '@app/hookshop-reads';
import type { InstalledActions } from './use-installed-actions.type';

const useInstalledActions = () => {
  const reload = useCatalogInstalled((state) => state.reload);
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
    const result = (await catalogApi()?.uninstall(pack.itemId)) ?? NO_CATALOG;
    await finish(result.ok ? null : result.error);
    return result.ok;
  }, [begin, finish]);

  const duplicate = useCallback(async (pack: InstalledPack): Promise<string | null> => {
    begin();
    const result = await requireHostApi().storeDuplicate(pack.itemId);
    await finish(result.ok ? null : result.error);
    return result.ok ? result.data.name : null;
  }, [begin, finish]);

  const update = useCallback(async (pack: InstalledPack): Promise<string | null> => {
    begin();
    const result = (await catalogApi()?.install({ itemId: pack.itemId, version: null })) ?? { ...NO_CATALOG, cancelled: false };
    const wroteNothing = result.ok || result.cancelled;
    await finish(wroteNothing ? null : result.error);
    return result.ok ? result.record.installedName : null;
  }, [begin, finish]);

  return { busy, error, uninstall, duplicate, update };
};

export { useInstalledActions };
export type { InstalledActions };
