/* @layer shared-storage @kind logic */
import type { MsuPackManifest } from '@rotp/game-data';
import { mapSounds } from './map-sounds';
import type { LayerTransform } from './msu-layer-edit.type';

const mapLayers = (manifest: MsuPackManifest, transform: LayerTransform): MsuPackManifest => ({
  ...manifest,
  tracks: manifest.tracks.map((track) => ({ ...track, layers: track.layers.map(transform) })),
  sounds: manifest.sounds === undefined ? undefined : mapSounds(manifest.sounds, transform),
});

export { mapLayers };
