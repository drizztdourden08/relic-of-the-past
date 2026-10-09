/* @layer electron-main @kind logic */
import type { FfmpegBinaries } from '../ffmpeg-paths';
import { canDownload, managedBinaries } from '../ffmpeg-paths';
import { bothExecutable } from './both-executable';
import { findOnPath } from './find-on-path';

const locateFfmpeg = async (): Promise<FfmpegBinaries | null> => {
  const managed = managedBinaries();
  if (await bothExecutable(managed)) return managed;
  return canDownload() ? null : findOnPath();
};

export { locateFfmpeg };
