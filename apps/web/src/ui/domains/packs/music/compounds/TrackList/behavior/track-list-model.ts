/* @layer renderer-components @kind logic */
/**
 * The rows and the summary line of a pack's track list, from its manifest alone. Tracks come
 * first in slot order, then the replaced sounds by channel. The file count is the manifest's
 * own file record when it carries one, else every file a slot names.
 */
import { DELUXE_TRACK_THRESHOLD } from '@shared/types/msu-manifest';
import { msuTrackName } from '@shared/game/data/msu-track-names';
import type { MsuLayer, MsuPackManifest, MsuSoundDef, SoundChannel } from '@shared/types/msu-manifest';
import { SOUND_CHANNEL_LABELS, SOUND_CHANNELS, soundHexId } from '../../../behavior/sound-names';
import type { PackSummaryLine, SlotRow } from '../TrackList.type';

const filesOf = (layers: MsuLayer[]): string[] => [...new Set(layers.flatMap((layer) => layer.files))];

const soundsOf = (manifest: MsuPackManifest): { channel: SoundChannel; sound: MsuSoundDef }[] =>
  SOUND_CHANNELS.flatMap((channel) => (manifest.sounds?.[channel] ?? []).map((sound) => ({ channel, sound })));

const trackRows = (manifest: MsuPackManifest): SlotRow[] => [...manifest.tracks]
  .sort((a, b) => a.trackNum - b.trackNum)
  .map((track) => ({
    key: `track-${track.trackNum}`,
    number: `#${track.trackNum}`,
    title: msuTrackName(track.trackNum) ?? `Track ${track.trackNum}`,
    layerCount: track.layers.length,
    files: filesOf(track.layers),
  }));

const soundRows = (manifest: MsuPackManifest): SlotRow[] => soundsOf(manifest).map(({ channel, sound }) => ({
  key: `${channel}-${sound.soundId}`,
  number: soundHexId(sound.soundId),
  title: SOUND_CHANNEL_LABELS[channel],
  layerCount: sound.layers.length,
  files: filesOf(sound.layers),
}));

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

const plural = (count: number, word: string): string => `${count} ${word}${count === 1 ? '' : 's'}`;

/** `61 tracks · 4 sounds · 188 files · deluxe`. */
const summaryText = (summary: PackSummaryLine): string => [
  plural(summary.tracks, 'track'),
  plural(summary.sounds, 'sound'),
  plural(summary.files, 'file'),
  ...(summary.deluxe ? ['deluxe'] : []),
].join(' · ');

export { trackRows, soundRows, packSummary, summaryText };
