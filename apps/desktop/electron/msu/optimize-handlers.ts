/* @layer electron-main @kind logic */
/**
 * IPC for normalising a pack to one audio format: measure first, convert second.
 *
 * The two are deliberately separate channels rather than one call with a flag. Measuring
 * really encodes a slice of every candidate, so it is slow enough to want its own progress and
 * its own result — and the whole point of it is that nothing is written until someone has read
 * the numbers and said yes.
 *
 * Both halves report per-file progress on one event, so a bar can follow either without the
 * renderer polling. Pack and file names arrive from the renderer, so every one of them becomes
 * a path only through ./pack-fs, which refuses a traversal before it joins.
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

/** Throws rather than answering null: both operations are meaningless without the encoder. */
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
