/* @layer electron-main @kind logic */
import type { MsuPackManifest } from '@rotp/game-data';

const withPackName = (manifest: MsuPackManifest, pack: string): MsuPackManifest =>
  ({ ...manifest, meta: { ...manifest.meta, name: pack } });

export { withPackName };
