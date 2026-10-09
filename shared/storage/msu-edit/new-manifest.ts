/* @layer shared-storage @kind logic */
import type { MsuPackManifest, MsuPackMeta } from '@shared/types/msu-manifest';

const newManifest = (pack: string, meta?: Partial<MsuPackMeta>): MsuPackManifest => {
  const now = Date.now();
  return { version: 1, meta: { name: pack, ...meta, createdAt: now, modifiedAt: now }, tracks: [] };
};

export { newManifest };
