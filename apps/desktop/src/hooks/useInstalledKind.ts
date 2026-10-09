/* @layer renderer-other @kind hook */
import { useCallback, useEffect, useMemo } from 'react';
import type { InstalledPack } from '@shared/store/installed-types';
import type { StoreKind } from '@shared/store/types';
import { installedFor, useInstalledStore } from '@app/stores/installed-store';

const useInstalledKind = (kind: StoreKind, selected: string | null) => {
  const packs = useInstalledStore((state) => state.packs);
  const watch = useInstalledStore((state) => state.watch);
  const pack = useInstalledStore(installedFor(kind, selected));

  useEffect(() => { watch(); }, [watch]);

  const byName = useMemo(
    () => new Map(packs.filter((one) => one.kind === kind).map((one) => [one.installedName, one])),
    [packs, kind],
  );

  const packFor = useCallback((name: string): InstalledPack | null => byName.get(name) ?? null, [byName]);

  return { pack, packFor };
};

export { useInstalledKind };
