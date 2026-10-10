/* @layer renderer-components @kind logic */
import { DELUXE_TRACK_THRESHOLD } from '@rotp/hub-contracts';
import type { MsuPackManifest } from '@rotp/game-data';
import type { PackSummaryLine } from '../TrackList.type';
import { filesOf } from './files-of';
import { soundsOf } from './sounds-of';

const packSummary = (manifest: MsuPackManifest): PackSummaryLine => {
  const sounds = soundsOf(manifest);
  const named = new Set([
    ...manifest.tracks.flatMap((track) => filesOf(track.layers)),
    ...sounds.flatMap(({ sound }) => filesOf(sound.layers)),
  ]);
  return {
    tracks: manifest.tracks.length,
    sounds: sounds.length,
    files: manifest.files?.length ?? named.size,
    deluxe: manifest.tracks.some((track) => track.trackNum >= DELUXE_TRACK_THRESHOLD),
  };
};

export { packSummary };
