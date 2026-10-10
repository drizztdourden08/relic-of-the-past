/* @layer renderer-components @kind logic */
import { msuTrackName } from '@rotp/game-data';
import type { MsuPackManifest } from '@rotp/game-data';
import type { SlotRow } from '../TrackList.type';
import { filesOf } from './files-of';

const trackRows = (manifest: MsuPackManifest): SlotRow[] => [...manifest.tracks]
  .sort((a, b) => a.trackNum - b.trackNum)
  .map((track) => ({
    key: `track-${track.trackNum}`,
    number: `#${track.trackNum}`,
    title: msuTrackName(track.trackNum) ?? `Track ${track.trackNum}`,
    layerCount: track.layers.length,
    files: filesOf(track.layers),
  }));

export { trackRows };
