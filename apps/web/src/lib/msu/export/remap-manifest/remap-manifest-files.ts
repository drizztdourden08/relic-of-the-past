/* @layer renderer-lib @kind logic */
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import { mapLayers } from '@shared/storage/msu-layer-edit';
import { mapName } from './map-name';

const remapManifestFiles = (manifest: MsuPackManifest, names: Map<string, string>): MsuPackManifest => {
  const remapped = mapLayers(manifest, (layer) => ({
    ...layer,
    files: layer.files.map((file) => mapName(names, file)),
  }));
  return manifest.meta.cover
    ? { ...remapped, meta: { ...remapped.meta, cover: mapName(names, manifest.meta.cover) } }
    : remapped;
};

export { remapManifestFiles };
