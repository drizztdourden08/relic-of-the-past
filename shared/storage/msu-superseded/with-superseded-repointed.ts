/* @layer shared-storage @kind logic */
import type { MsuPackManifest } from '@rotp/game-data';
import { mapLayers } from '../msu-layer-edit';
import { repointFiles } from './repoint-files';
import { targetsByStem } from './targets-by-stem';

const withSupersededRepointed = (manifest: MsuPackManifest, names: string[]): MsuPackManifest => {
  const targets = targetsByStem(names);
  if (targets.size === 0) return manifest;
  let changed = false;
  const next = mapLayers(manifest, (layer) => {
    const files = repointFiles(layer.files, targets);
    if (files === null) return layer;
    changed = true;
    return { ...layer, files };
  });
  return changed ? next : manifest;
};

export { withSupersededRepointed };
