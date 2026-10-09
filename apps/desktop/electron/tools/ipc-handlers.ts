/* @layer electron-main @kind logic */
import { isAbsolute, join, normalize, relative } from 'path';
import type { MainContext } from '@drizztdourden08/brock-electron/main';
import { getUserDataPath, handle } from '@drizztdourden08/brock-electron/main';
import { getTools } from '@drizztdourden08/brock-tools/main';
import { probeFile } from './probe-file';

const resolveInDataRoot = (dataPath: string): string => {
  const root = getUserDataPath();
  const full = join(root, normalize(dataPath));
  const back = relative(root, full);
  if (back.startsWith('..') || isAbsolute(back)) throw new Error(`path escapes data root: ${dataPath}`);
  return full;
};

const registerFfmpegHandlers = (ctx: MainContext): void => {
  handle('ffmpeg:probeAudio', (_event, dataPath) => probeFile(getTools(ctx), resolveInDataRoot(dataPath)));
};

export { registerFfmpegHandlers };
