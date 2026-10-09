/* @layer shared-storage @kind logic */
import type { MsuPackManifest } from '@shared/types/msu-manifest';

const withPackName = (manifest: MsuPackManifest, pack: string): MsuPackManifest =>
  ({ ...manifest, meta: { ...manifest.meta, name: pack } });

export { withPackName };
