/* @layer renderer-lib @kind logic */
/**
 * Rewrites every filename a manifest references through a name→name map, so a manifest written
 * beside deduped files still resolves.
 *
 * This is the half of dedupe that is easy to get wrong: miss one reference site and the pack
 * imports but a layer plays silence. There are exactly two sites — a layer's `files` list and
 * the cover image — and both are handled here, unconditionally, rather than at the call site.
 */
import type { MsuLayer, MsuPackManifest, MsuTrackDef } from '@shared/types/msu-manifest';

/** A name with no mapping keeps itself, so a partial map degrades to a no-op, never to a loss. */
const mapName = (names: Map<string, string>, name: string): string => names.get(name) ?? name;

const remapLayer = (layer: MsuLayer, names: Map<string, string>): MsuLayer => ({
  ...layer,
  files: layer.files.map((file) => mapName(names, file)),
});

const remapTrack = (track: MsuTrackDef, names: Map<string, string>): MsuTrackDef => ({
  ...track,
  layers: track.layers.map((layer) => remapLayer(layer, names)),
});

const remapManifestFiles = (manifest: MsuPackManifest, names: Map<string, string>): MsuPackManifest => ({
  ...manifest,
  meta: manifest.meta.cover
    ? { ...manifest.meta, cover: mapName(names, manifest.meta.cover) }
    : manifest.meta,
  tracks: manifest.tracks.map((track) => remapTrack(track, names)),
});

/** Every filename the manifest points at, in reference order, duplicates included. */
const referencedFiles = (manifest: MsuPackManifest): string[] => {
  const names = manifest.tracks.flatMap((track) => track.layers.flatMap((layer) => layer.files));
  return manifest.meta.cover ? [...names, manifest.meta.cover] : names;
};

export { remapManifestFiles, referencedFiles };
