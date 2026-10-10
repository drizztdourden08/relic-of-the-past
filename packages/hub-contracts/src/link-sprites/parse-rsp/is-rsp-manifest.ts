/* @layer shared-storage @kind logic */
import type { RspManifest } from '../rsp.type';

const isRspManifest = (value: unknown): value is RspManifest => {
  if (typeof value !== 'object' || value === null) return false;
  const manifest = value as RspManifest;
  return manifest.format === 'rsp'
    && Boolean(manifest.palettes?.original) && Boolean(manifest.meta);
};

export { isRspManifest };
