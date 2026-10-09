/* @layer renderer-other @kind hook */
import { useCallback, useMemo } from 'react';
import type { InstalledPack } from '@shared/store/installed-types';
import type { StoreKind } from '@shared/store/types';
import { useInstalledPacks } from './useInstalledPacks';

const useInstalledKind = (kind: StoreKind, selected: string | null) => {
  const packs = useInstalledPacks();

  const byName = useMemo(
    () => new Map(packs.filter((one) => one.kind === kind).map((one) => [one.installedName, one])),
    [packs, kind],
  );

  const packFor = useCallback((name: string): InstalledPack | null => byName.get(name) ?? null, [byName]);
  const pack = selected === null ? null : packFor(selected);

  return { pack, packFor };
};

export { useInstalledKind };
