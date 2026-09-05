/* @layer electron-main @kind logic */
/**
 * Find a usable ffmpeg/ffprobe pair without installing anything: the managed install
 * under the app's data root, then (on a platform we do not download for) PATH. A
 * system copy is never checksum-verified; it is the user's own and we did not fetch it.
 */
import { access } from 'fs/promises';
import { constants } from 'fs';
import { delimiter, join } from 'path';
import type { FfmpegState } from '@shared/types/ffmpeg-tool';
import { FFMPEG_LINUX_PACKAGE } from '@shared/types/ffmpeg-tool';
import type { FfmpegBinaries } from './ffmpeg-paths';
import { canDownload, exeName, isLinux, managedBinaries } from './ffmpeg-paths';

const isExecutable = async (path: string): Promise<boolean> => {
  try {
    await access(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
};

const bothExecutable = async (bins: FfmpegBinaries): Promise<boolean> =>
  (await isExecutable(bins.ffmpegPath)) && (await isExecutable(bins.ffprobePath));

/** First PATH entry holding BOTH binaries. A dir with only one of them is no use. */
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

/** The binaries to use right now, or null when none are present. */
const locateFfmpeg = async (): Promise<FfmpegBinaries | null> => {
  const managed = managedBinaries();
  if (await bothExecutable(managed)) return managed;
  return canDownload() ? null : findOnPath();
};

/** `locateFfmpeg` as a reportable state: ready, installable, or not served here. */
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

export { ffmpegState, locateFfmpeg };
