/* @layer renderer-lib @kind logic */
import type { MsuPackManifest } from '@shared/types/msu-manifest';

const serializeForExport = (manifest: MsuPackManifest): Uint8Array =>
  new TextEncoder().encode(`${JSON.stringify(manifest, null, 2)}\n`);

export { serializeForExport };
