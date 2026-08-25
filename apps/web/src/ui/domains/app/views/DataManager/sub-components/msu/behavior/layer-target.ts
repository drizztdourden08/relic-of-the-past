/* @layer renderer-components @kind logic */
/**
 * Where a layer list lives inside a manifest.
 *
 * A music slot and a claimed sound hold the identical layer shape in two different places, so
 * the editor is handed the pair of accessors instead of a slot number (Strategy). One editor,
 * one save path, one live readout — and none of them has to learn which kind it is looking at,
 * which is what keeps a sound's layers from needing a second copy of all of it.
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
}

const trackTarget = (trackNum: number): LayerTarget => ({
  previewKey: trackPreviewKey(trackNum),
  label: `slot ${trackNum}`,
  read: (manifest) => layersOfTrack(manifest, trackNum),
  write: (base, layers) => withTrackLayers(base, trackNum, layers),
});

const soundTarget = (channel: SoundChannel, soundId: number): LayerTarget => ({
  previewKey: soundPreviewKey(channel, soundId),
  label: soundTitle(channel, soundId),
  read: (manifest) => layersOfSound(manifest, channel, soundId),
  write: (base, layers) => withSoundLayers(base, channel, soundId, layers),
});

export { trackTarget, soundTarget };
export type { LayerTarget };
