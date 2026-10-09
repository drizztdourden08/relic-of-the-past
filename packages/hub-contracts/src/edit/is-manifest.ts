/* @layer shared-storage @kind logic */
import type { MsuPackManifest } from '@rotp/game-data';

const isManifest = (value: unknown): value is MsuPackManifest => {
  const m = value as MsuPackManifest | null;
  return !!m && m.version === 1 && !!m.meta && Array.isArray(m.tracks);
};

export { isManifest };
