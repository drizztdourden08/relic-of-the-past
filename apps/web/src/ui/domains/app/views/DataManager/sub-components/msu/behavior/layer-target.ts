/* @layer renderer-components @kind logic */
/**
 * Where a layer list lives inside a manifest. A music slot and a claimed sound hold the same layer
 * shape in two places, so the editor gets a pair of accessors instead of a slot number (Strategy).
 */
import type { MsuLayer, MsuPackManifest, SoundChannel } from '@shared/types/msu-manifest';
import { layersOfTrack, withTrackLayers } from './pack-manifest';
import { layersOfSound, withSoundLayers } from './sound-manifest';
import { soundPreviewKey, trackPreviewKey } from './preview-key';
import { soundTitle } from '../sound-labels';

interface LayerTarget {
  /** Identifies it in the live report, so a layer card's readout knows it is the one playing. */
  previewKey: string;
  /** Names it in the editor's heading. */
  label: string;
  read: (manifest: MsuPackManifest) => MsuLayer[];
  write: (base: MsuPackManifest, layers: MsuLayer[]) => MsuPackManifest;
  /** True on the effect channels, where a looping layer has nothing to end it and would follow the player around. */
  oneShot: boolean;
}

const trackTarget = (trackNum: number): LayerTarget => ({
  previewKey: trackPreviewKey(trackNum),
  label: `slot ${trackNum}`,
  read: (manifest) => layersOfTrack(manifest, trackNum),
  write: (base, layers) => withTrackLayers(base, trackNum, layers),
  oneShot: false,
});

const soundTarget = (channel: SoundChannel, soundId: number): LayerTarget => ({
  previewKey: soundPreviewKey(channel, soundId),
  label: soundTitle(channel, soundId),
  read: (manifest) => layersOfSound(manifest, channel, soundId),
  write: (base, layers) => withSoundLayers(base, channel, soundId, layers),
  oneShot: channel !== 'ambient',
});

export { trackTarget, soundTarget };
export type { LayerTarget };
