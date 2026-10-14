/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import type { MsuPackManifest, SoundChannel } from '@rotp/game-data';
import { soundTitle } from '../sound-labels';
import type { FileUsageMap } from './file-usage.type';

const noteLayerFiles = (layers: { files: string[] }[], place: string, note: (fileName: string, place: string) => void): void => {
  for (const layer of layers) {
    for (const file of layer.files) note(file, place);
  }
};

const useFileUsage = (manifest: MsuPackManifest): FileUsageMap => useMemo(() => {
  const usage: FileUsageMap = new Map();
  const note = (fileName: string, place: string): void => {
    const places = usage.get(fileName);
    if (places === undefined) usage.set(fileName, [place]);
    else if (!places.includes(place)) places.push(place);
  };

  for (const track of manifest.tracks) noteLayerFiles(track.layers, `Slot ${track.trackNum}`, note);
  for (const [channel, defs] of Object.entries(manifest.sounds ?? {})) {
    for (const def of defs) noteLayerFiles(def.layers, soundTitle(channel as SoundChannel, def.soundId), note);
  }
  return usage;
}, [manifest]);

export { useFileUsage };
