/* @layer renderer-stores @kind logic */
import type { InstalledPack } from '@shared/store/installed-types';
import type { StoreKind } from '@shared/store/types';
import type { InstalledStore } from './installed-store.type';

const installedFor = (kind: StoreKind, name: string | null) =>
  (state: InstalledStore): InstalledPack | null =>
    (name === null ? null : state.packs.find((pack) => pack.kind === kind && pack.installedName === name) ?? null);

export { installedFor };
