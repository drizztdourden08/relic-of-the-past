/* @layer renderer-other @kind hook */
import { useEffect, useMemo } from 'react';
import { useCatalogInstalled } from '@drizztdourden08/brock-catalog/renderer';
import { packOfRecord } from '@rotp/hub-contracts';
import type { InstalledPack } from '@rotp/hub-contracts';

const useInstalledPacks = (): InstalledPack[] => {
  const records = useCatalogInstalled((state) => state.records);
  const watch = useCatalogInstalled((state) => state.watch);

  useEffect(() => { watch(); }, [watch]);

  return useMemo(() => records.map(packOfRecord).filter((pack): pack is InstalledPack => pack !== null), [records]);
};

export { useInstalledPacks };
