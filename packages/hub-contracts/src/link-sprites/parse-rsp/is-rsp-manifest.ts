/* @layer shared-storage @kind logic */
import type { RspManifest } from '../rsp.type';

const isRspManifest = (value: unknown): value is RspManifest => {
  const manifest = value as RspManifest | null;
  return !!manifest && typeof manifest === 'object' && manifest.format === 'rsp'
    && !!manifest.palettes?.original && !!manifest.meta;
};

export { isRspManifest };
