/* @layer electron-main @kind logic */
import type { OptimizeProgress } from '@shared/types/msu-optimize';
import { emit, handle } from '../lib/ipc/handle';
import { getMainWindow } from '../window';
import { locateFfmpeg } from '../tools/ffmpeg-locate';
import { analyzePack } from './optimize/analyze';
import { convertPack } from './optimize/run';
import { TOOL_MISSING } from './optimize-handlers.constants';

const reportProgress = (progress: OptimizeProgress): void => {
  const win = getMainWindow();
  if (win) emit(win, 'msu:optimize:progress', progress);
};

const requireEncoder = async (): Promise<string> => {
  const found = await locateFfmpeg();
  if (!found) throw new Error(TOOL_MISSING);
  return found.ffmpegPath;
};

const registerMsuOptimizeHandlers = (): void => {
  handle('msu:optimize:analyze', async (_event, packName: string) => analyzePack({
    pack: packName,
    ffmpegPath: await requireEncoder(),
    report: reportProgress,
  }));

  handle('msu:optimize:run', async (_event, packName: string, fileNames: string[]) => convertPack({
    pack: packName,
    ffmpegPath: await requireEncoder(),
    fileNames,
    report: reportProgress,
  }));
};

export { registerMsuOptimizeHandlers };
