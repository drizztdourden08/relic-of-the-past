/* @layer electron-main @kind logic */
/**
 * IPC for normalising a pack to one audio format: measure first, convert second.
 *
 * Two separate channels, not one call with a flag: measuring encodes a slice of every
 * candidate, so it wants its own progress and result, and nothing is written until
 * someone has read the numbers and said yes.
 *
 * Both report per-file progress on one event. Pack and file names come from the renderer,
 * so they become paths only through ./pack-fs, which refuses a traversal.
 */
import type { OptimizeProgress } from '@shared/types/msu-optimize';
import { emit, handle } from '../lib/ipc/handle';
import { getMainWindow } from '../window';
import { locateFfmpeg } from '../tools/ffmpeg-locate';
import { analyzePack } from './optimize/analyze';
import { convertPack } from './optimize/run';

const TOOL_MISSING = 'The audio tool is not installed, so nothing can be measured or converted.';

const reportProgress = (progress: OptimizeProgress): void => {
  const win = getMainWindow();
  if (win) emit(win, 'msu:optimize:progress', progress);
};

/** Throws, not null: both operations are meaningless without the encoder. */
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
