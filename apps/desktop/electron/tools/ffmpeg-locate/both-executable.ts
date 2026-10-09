/* @layer electron-main @kind logic */
import type { FfmpegBinaries } from '../ffmpeg-paths';
import { isExecutable } from './is-executable';

const bothExecutable = async (bins: FfmpegBinaries): Promise<boolean> =>
  (await isExecutable(bins.ffmpegPath)) && (await isExecutable(bins.ffprobePath));

export { bothExecutable };
