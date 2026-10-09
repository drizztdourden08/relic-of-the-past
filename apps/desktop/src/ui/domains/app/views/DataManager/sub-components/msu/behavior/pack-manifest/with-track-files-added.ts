/* @layer renderer-components @kind logic */
import type { MsuPackManifest } from '@rotp/game-data';
import { layersOfTrack } from './layers-of-track';
import { withTrackFiles } from './with-track-files';

const withTrackFilesAdded = (
  manifest: MsuPackManifest, trackNum: number, fileNames: string[],
): MsuPackManifest => {
  if (fileNames.length === 0) return manifest;
  const existing = layersOfTrack(manifest, trackNum)[0]?.files ?? [];
  return withTrackFiles(manifest, trackNum, [...existing, ...fileNames.filter((f) => !existing.includes(f))]);
};

export { withTrackFilesAdded };
