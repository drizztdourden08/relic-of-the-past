/* @layer electron-main @kind logic */
import type { FfmpegState } from '@shared/types/ffmpeg-tool';
import { FFMPEG_LINUX_PACKAGE } from '@shared/types/ffmpeg-tool';
import { canDownload, isLinux } from '../ffmpeg-paths';
import { locateFfmpeg } from './locate-ffmpeg';

const ffmpegState = async (): Promise<FfmpegState> => {
  const found = await locateFfmpeg();
  if (found) return { status: 'ready', ...found };
  if (canDownload()) return { status: 'missing' };
  if (isLinux()) {
    return {
      status: 'unavailable',
      reason: `No ffmpeg on PATH. Install the "${FFMPEG_LINUX_PACKAGE}" package with your package manager.`,
      installPackage: FFMPEG_LINUX_PACKAGE,
    };
  }
  return { status: 'unavailable', reason: 'ffmpeg is not available on this platform.' };
};

export { ffmpegState };
