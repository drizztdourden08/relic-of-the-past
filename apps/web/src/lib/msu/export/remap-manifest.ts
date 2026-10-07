/* @layer renderer-lib @kind logic */
/**
 * Rewrites every filename a manifest references through a name→name map, so a manifest written
 * beside deduped files still resolves.
 *
 * This is the half of dedupe that is easy to get wrong: miss one reference site and the pack
 * imports but a layer plays silence. There are exactly two sites, a layer's `files` list and
 * the cover image, and both are handled here, unconditionally, instead of at the call site.
 *
 * Layers live in BOTH halves of a manifest: the music slots and the sound channels. The walk goes
 * through `mapLayers`, the one place that knows both, because an export that listed only the
 * tracks' files really did ship packs whose ambient bed named a file that was never written. The
 * pack imported and the rain played nothing.
 */
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import { mapLayers } from '@shared/storage/msu-layer-edit';

/** A name with no mapping keeps itself, so a partial map degrades to a no-op, never to a loss. */
const mapName = (names: Map<string, string>, name: string): string => names.get(name) ?? name;

const remapManifestFiles = (manifest: MsuPackManifest, names: Map<string, string>): MsuPackManifest => {
  const remapped = mapLayers(manifest, (layer) => ({
    ...layer,
    files: layer.files.map((file) => mapName(names, file)),
  }));
  return manifest.meta.cover
    ? { ...remapped, meta: { ...remapped.meta, cover: mapName(names, manifest.meta.cover) } }
    : remapped;
};

/** Every filename the manifest points at, in reference order, duplicates included. */
const referencedFiles = (manifest: MsuPackManifest): string[] => {
  const names: string[] = [];
  mapLayers(manifest, (layer) => { names.push(...layer.files); return layer; });
  return manifest.meta.cover ? [...names, manifest.meta.cover] : names;
};

export { remapManifestFiles, referencedFiles };
