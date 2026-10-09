/* @layer electron-main @kind logic */
import type { MainContext } from '@drizztdourden08/brock-electron/main';
import type { ToolsMain } from '@drizztdourden08/brock-tools/main';
import type { OptimizeProgress } from '@shared/types/msu-optimize';
import { emit, handle, getMainWindow } from '@drizztdourden08/brock-electron/main';
import { getTools } from '@drizztdourden08/brock-tools/main';
import { FFMPEG_TOOL_ID } from '@shared/types/ffmpeg-tool';
import { analyzePack } from './optimize/analyze';
import { convertPack } from './optimize/run';
import { TOOL_MISSING } from './optimize-handlers.constants';

const reportProgress = (progress: OptimizeProgress): void => {
  const win = getMainWindow();
  if (win) emit(win, 'msu:optimize:progress', progress);
};

const requireEncoder = async (ctx: MainContext): Promise<ToolsMain> => {
  const tools = getTools(ctx);
  const state = await tools.state(FFMPEG_TOOL_ID);
  if (state?.status !== 'ready') throw new Error(TOOL_MISSING);
  return tools;
};

const registerMsuOptimizeHandlers = (ctx: MainContext): void => {
  handle('msu:optimize:analyze', async (_event, packName: string) => analyzePack({
    pack: packName,
    tools: await requireEncoder(ctx),
    report: reportProgress,
  }));

  handle('msu:optimize:run', async (_event, packName: string, fileNames: string[]) => convertPack({
    pack: packName,
    tools: await requireEncoder(ctx),
    fileNames,
    report: reportProgress,
  }));
};

export { registerMsuOptimizeHandlers };
