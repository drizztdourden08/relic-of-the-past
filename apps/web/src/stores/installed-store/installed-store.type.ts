/* @layer renderer-stores @kind types */
import type { InstalledPack } from '@shared/store/installed-types';

interface InstalledStore {
  packs: InstalledPack[];
  reload: () => Promise<void>;
  watch: () => void;
}

export type { InstalledStore };
