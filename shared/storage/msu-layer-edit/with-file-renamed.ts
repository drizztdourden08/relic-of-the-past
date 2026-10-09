/* @layer shared-storage @kind logic */
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import { mapLayers } from './map-layers';
import { sameName } from './same-name';

const withFileRenamed = (manifest: MsuPackManifest, from: string, to: string): MsuPackManifest =>
  mapLayers(manifest, (layer) => (layer.files.some((file) => sameName(file, from))
    ? { ...layer, files: layer.files.map((file) => (sameName(file, from) ? to : file)) }
    : layer));

export { withFileRenamed };
