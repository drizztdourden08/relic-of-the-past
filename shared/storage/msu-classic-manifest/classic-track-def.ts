/* @layer shared-storage @kind logic */
import type { MsuTrackDef } from '@rotp/game-data';
import { trackRepeats } from '@rotp/game-data';
import type { ClassicTrack } from './msu-classic-manifest.type';

const classicTrackDef = (track: ClassicTrack): MsuTrackDef => ({
  trackNum: track.trackNum,
  layers: [{
    id: `track-${track.trackNum}`,
    name: `Track ${track.trackNum}`,
    files: [track.fileName],
    mode: trackRepeats(track.trackNum) ? { kind: 'loop', order: 'single' } : { kind: 'once' },
    volume: 100,
  }],
});

export { classicTrackDef };
