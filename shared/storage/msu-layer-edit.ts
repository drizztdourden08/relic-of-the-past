/* @layer shared-storage @kind logic */
/**
 * Whole-manifest transforms that rewrite every layer, wherever it sits.
 *
 * Both halves of a manifest carry layers — music slots and sound channels — and the same file
 * can be a music layer's and a sound layer's at once, so a transform that walked only the
 * tracks would leave half the pack pointing at the old thing. `mapLayers` is the one walk, and
 * each transform is the per-layer rule it applies.
 *
 * The manifest is rebuilt WHOLE, so a channel a transform does not touch is still copied
 * across; anything left out would be dropped from the pack on the next save.
 *
 * This lives in shared rather than beside the pack editor because both sides need it: the
 * renderer re-points a manifest when a file is renamed by hand, and the main process re-points
 * the same manifest when a file's format changes under it.
 */
import type { MsuLayer, MsuPackManifest, MsuSoundDef, SoundChannel } from '@shared/types/msu-manifest';

type LayerTransform = (layer: MsuLayer) => MsuLayer;

const mapSounds = (
  sounds: Partial<Record<SoundChannel, MsuSoundDef[]>>, transform: LayerTransform,
): Partial<Record<SoundChannel, MsuSoundDef[]>> => {
  const next: Partial<Record<SoundChannel, MsuSoundDef[]>> = {};
  for (const [channel, defs] of Object.entries(sounds)) {
    next[channel as SoundChannel] = defs.map((def) => ({ ...def, layers: def.layers.map(transform) }));
  }
  return next;
};

const mapLayers = (manifest: MsuPackManifest, transform: LayerTransform): MsuPackManifest => ({
  ...manifest,
  tracks: manifest.tracks.map((track) => ({ ...track, layers: track.layers.map(transform) })),
  sounds: manifest.sounds === undefined ? undefined : mapSounds(manifest.sounds, transform),
});

/**
 * One filename swapped for another everywhere the manifest names it.
 *
 * Storage renames the bytes and nothing else, so without this a layered pack goes on pointing
 * at the old name and every slot built on that file falls silent.
 */
const withFileRenamed = (manifest: MsuPackManifest, from: string, to: string): MsuPackManifest =>
  mapLayers(manifest, (layer) => (layer.files.includes(from)
    ? { ...layer, files: layer.files.map((file) => (file === from ? to : file)) }
    : layer));

/**
 * A repeat point read out of a file's own header, written into the layers that play it.
 *
 * Only a layer that does not already declare one is filled in: an explicit `loopSample` is the
 * pack author's decision and outranks whatever the file happens to say. A layer drawing on
 * several files can hold only ONE repeat point, so the first of its files to declare one wins
 * — that is the limit of what the format can express, not a choice made here.
 */
const withLoopSampleCarried = (
  manifest: MsuPackManifest, fileName: string, loopSample: number,
): MsuPackManifest =>
  mapLayers(manifest, (layer) => (layer.loopSample === undefined && layer.files.includes(fileName)
    ? { ...layer, loopSample }
    : layer));

export { mapLayers, withFileRenamed, withLoopSampleCarried };
export type { LayerTransform };
