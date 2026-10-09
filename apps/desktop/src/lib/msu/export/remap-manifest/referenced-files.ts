/* @layer renderer-lib @kind logic */
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import { mapLayers } from '@shared/storage/msu-layer-edit';

const referencedFiles = (manifest: MsuPackManifest): string[] => {
  const names: string[] = [];
  mapLayers(manifest, (layer) => { names.push(...layer.files); return layer; });
  return manifest.meta.cover ? [...names, manifest.meta.cover] : names;
};

export { referencedFiles };
