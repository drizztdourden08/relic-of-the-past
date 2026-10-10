/* @layer shared-storage @kind logic */
import type { MsuPackManifest } from '@rotp/game-data';

const isManifest = (value: unknown): value is MsuPackManifest => {
  if (typeof value !== 'object' || value === null) return false;
  const m = value as MsuPackManifest;
  return m.version === 1 && Boolean(m.meta) && Array.isArray(m.tracks);
};

export { isManifest };
