/* @layer electron-main @kind logic */
import type { MainContext } from '@drizztdourden08/brock-electron/main';
import { handle } from '@drizztdourden08/brock-electron/main';
import { getTools } from '@drizztdourden08/brock-tools/main';
import type {
  DebugCaptureDeleteSessionResult, DebugCaptureFinalizeResult, DebugCaptureSessionSummary,
} from '@app/debug-report';
import { deleteSession } from './delete-session';
import { finalizeCaptureSession } from './finalize-capture-session';
import { listCaptureSessions } from './list-sessions';

const registerDebugReportHandlers = (ctx: MainContext): void => {
  handle('debug-capture:finalizeSession', async (_event, input): Promise<DebugCaptureFinalizeResult> =>
    finalizeCaptureSession(getTools(ctx), input));

  handle('debug-capture:listSessions', async (_event, { profileId }): Promise<DebugCaptureSessionSummary[]> =>
    listCaptureSessions(profileId));

  handle('debug-capture:deleteSession', async (_event, { profileId, sessionKey }): Promise<DebugCaptureDeleteSessionResult> =>
    deleteSession(profileId, sessionKey));
};

export { registerDebugReportHandlers };
