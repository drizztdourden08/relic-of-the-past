/* @layer renderer-components @kind hook */
/**
 * Which places in the pack name each file.
 *
 * Both halves of the manifest count: a file is in use if any music slot's layer OR any sound
 * channel's layer lists it, and one file can serve several of them at once. A file nothing names
 * is unused — it still sits in the pack and still costs its bytes, but nothing will ever play it.
 *
 * The map is keyed by filename so a row can ask about itself; building it once per manifest is
 * what keeps a hundred rows from each scanning the whole manifest.
 */
import { useMemo } from 'react';
import type { MsuPackManifest, SoundChannel } from '@shared/types/msu-manifest';
import { soundTitle } from '../sound-labels';

/** Filename → the places that name it, in the wording the studio uses for them elsewhere. */
type FileUsageMap = Map<string, string[]>;

const useFileUsage = (manifest: MsuPackManifest): FileUsageMap => useMemo(() => {
  const usage: FileUsageMap = new Map();
  const note = (fileName: string, place: string): void => {
    const places = usage.get(fileName);
    if (places === undefined) usage.set(fileName, [place]);
    else if (!places.includes(place)) places.push(place);
  };

  for (const track of manifest.tracks) {
    for (const layer of track.layers) {
      for (const file of layer.files) note(file, `Slot ${track.trackNum}`);
    }
  }
  for (const [channel, defs] of Object.entries(manifest.sounds ?? {})) {
    for (const def of defs) {
      for (const layer of def.layers) {
        for (const file of layer.files) note(file, soundTitle(channel as SoundChannel, def.soundId));
      }
    }
  }
  return usage;
}, [manifest]);

export { useFileUsage };
export type { FileUsageMap };
