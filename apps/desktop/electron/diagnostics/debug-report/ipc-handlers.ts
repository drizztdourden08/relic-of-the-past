/* @layer electron-main @kind logic */
import type { MainContext } from '@drizztdourden08/brock-electron/main';
import { handle } from '@drizztdourden08/brock-electron/main';
import { getTools } from '@drizztdourden08/brock-tools/main';
import type { DebugCaptureFinalizeResult } from '@app/debug-report';
import { finalizeCaptureSession } from './finalize-capture-session';

const registerDebugReportHandlers = (ctx: MainContext): void => {
  handle('debug-capture:finalizeSession', async (_event, input): Promise<DebugCaptureFinalizeResult> =>
    finalizeCaptureSession(getTools(ctx), input));
};

export { registerDebugReportHandlers };
