/* @layer electron-main @kind logic */
import { join } from 'path';
import { exeName } from './exe-name';
import { ffmpegToolDir } from './ffmpeg-tool-dir';
import type { FfmpegBinaries } from './ffmpeg-paths.type';

const managedBinaries = (): FfmpegBinaries => ({
  ffmpegPath: join(ffmpegToolDir(), exeName('ffmpeg')),
  ffprobePath: join(ffmpegToolDir(), exeName('ffprobe')),
});

export { managedBinaries };
