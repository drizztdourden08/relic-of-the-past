/* @layer electron-main @kind logic */
import { delimiter, join } from 'path';
import type { FfmpegBinaries } from '../ffmpeg-paths';
import { exeName } from '../ffmpeg-paths';
import { bothExecutable } from './both-executable';

const findOnPath = async (): Promise<FfmpegBinaries | null> => {
  for (const dir of (process.env.PATH ?? '').split(delimiter).filter(Boolean)) {
    const bins = {
      ffmpegPath: join(dir, exeName('ffmpeg')),
      ffprobePath: join(dir, exeName('ffprobe')),
    };
    if (await bothExecutable(bins)) return bins;
  }
  return null;
};

export { findOnPath };
