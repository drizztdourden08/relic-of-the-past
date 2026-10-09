/* @layer renderer-components @kind logic */
import { msuTrackName } from '@shared/game/data/msu-track-names';
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import type { SlotRow } from '../../TrackList.type';
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
