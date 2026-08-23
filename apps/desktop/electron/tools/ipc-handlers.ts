/* @layer electron-main @kind logic */
/**
 * IPC for the optional ffmpeg tool: query, install, probe.
 *
 * The probe takes a Data-root-relative POSIX path, not an absolute one — the renderer
 * never gets to name a path outside the app's own storage, and traversal out of the root
 * is refused the same way the generic file store refuses it.
 */
import { isAbsolute, join, normalize, relative } from 'path';
import type { FfmpegState } from '@shared/types/ffmpeg-tool';
import { handle, emit } from '../lib/ipc/handle';
import { getUserDataPath } from '../lib/paths';
import { getMainWindow } from '../window';
import { ffmpegState } from './ffmpeg-locate';
import { installFfmpeg } from './ffmpeg-install';
import { probeFile } from './ffmpeg-run';

const resolveInDataRoot = (dataPath: string): string => {
  const root = getUserDataPath();
  const full = join(root, normalize(dataPath));
  const back = relative(root, full);
  if (back.startsWith('..') || isAbsolute(back)) throw new Error(`path escapes data root: ${dataPath}`);
  return full;
};

const reportState = (state: FfmpegState): void => {
  const win = getMainWindow();
  if (win) emit(win, 'ffmpeg:progress', state);
};

const registerFfmpegHandlers = (): void => {
  handle('ffmpeg:getState', () => ffmpegState());
  handle('ffmpeg:install', () => installFfmpeg(reportState));
  handle('ffmpeg:probeAudio', (_event, dataPath) => probeFile(resolveInDataRoot(dataPath)));
};

export { registerFfmpegHandlers };
