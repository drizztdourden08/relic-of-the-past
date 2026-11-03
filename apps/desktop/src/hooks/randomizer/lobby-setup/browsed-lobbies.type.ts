/* @layer renderer-lib @kind types */
import type { BrowsedEntry } from '@app/game/archipelia';

interface BrowsedLobbies {
  entries: BrowsedEntry[];
  loading: boolean;
}

export type { BrowsedLobbies };
