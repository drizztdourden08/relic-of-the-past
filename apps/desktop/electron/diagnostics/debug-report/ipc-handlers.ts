/* @layer electron-main @kind logic */
import { randomUUID } from 'crypto';
import { handle } from '../../lib/ipc/handle';
import type {
  DebugCaptureFinalizeResult, DebugReportBuildResult,
  DebugCaptureSessionSummary, DebugCaptureDeleteSessionResult,
} from '@shared/types/debug-report';
import { collectDebugReportFiles } from './collect-files';
import { collectCaptureSessions } from './collect-capture-sessions';
import { buildDebugReportZip } from './build-zip';
import { finalizeCaptureSession } from './finalize-capture-session';
import { storePendingReport } from './pending-reports';
import { listCaptureSessions } from './list-sessions';
import { deleteSession } from './delete-session';

const registerDebugReportHandlers = (): void => {
  handle('debug-capture:finalizeSession', async (_event, input): Promise<DebugCaptureFinalizeResult> =>
    finalizeCaptureSession(input));

  handle('debug-capture:listSessions', async (_event, { profileId }): Promise<DebugCaptureSessionSummary[]> =>
    listCaptureSessions(profileId));

  handle('debug-capture:deleteSession', async (_event, { profileId, sessionKey }): Promise<DebugCaptureDeleteSessionResult> =>
    deleteSession(profileId, sessionKey));

  handle('debug-report:build', async (_event, input): Promise<DebugReportBuildResult> => {
    try {
      const [files, captureSessions] = await Promise.all([
        collectDebugReportFiles(input.profileId),
        collectCaptureSessions(input.profileId, input.sessionKeys),
      ]);
      const zip = await buildDebugReportZip(input, files, captureSessions);
      const reportId = randomUUID().slice(0, 12);
      storePendingReport(reportId, zip, input.profileId, input.sessionKeys);
      return { reportId };
    } catch (err) {
      return { error: err instanceof Error ? err.message : String(err) };
    }
  });
};

export { registerDebugReportHandlers };
