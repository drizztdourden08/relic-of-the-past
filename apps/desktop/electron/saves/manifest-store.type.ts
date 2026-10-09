/* @layer electron-main @kind types */
import type { SaveSlotStat } from './save-slot.type';

interface ManifestEntry {
  id: string;
  timestamp: number;
}

interface ManifestStoreConfig<TEntry extends ManifestEntry, TInfo> {
  getDir: (profileId: string) => string;
  toInfo: (entry: TEntry, slot: SaveSlotStat) => TInfo;
}

export type { ManifestEntry, ManifestStoreConfig };
