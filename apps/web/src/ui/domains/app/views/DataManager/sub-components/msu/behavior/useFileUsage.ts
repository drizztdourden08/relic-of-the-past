/* @layer renderer-components @kind hook */
// Filename -> the slots and sounds that name it. Built once per manifest so rows do not each scan it.
import { useMemo } from 'react';
import type { MsuPackManifest, SoundChannel } from '@shared/types/msu-manifest';
import { soundTitle } from '../sound-labels';

/** Filename -> the places that name it, in the wording the studio uses elsewhere. */
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
