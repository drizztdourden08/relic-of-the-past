/* @layer electron-main @kind logic */
import { randomUUID } from 'crypto';
import { handle } from '../../lib/ipc/handle';
import type {
  DebugCaptureFinalizeResult, DebugReportBuildResult, DebugReportUploadResult,
  DebugCaptureSessionSummary, DebugCaptureDeleteSessionResult,
} from '@shared/types/debug-report';
import { collectDebugReportFiles } from './collect-files';
import { collectCaptureSessions } from './collect-capture-sessions';
import { buildDebugReportZip } from './build-zip';
import { uploadDebugReportZip } from './upload';
import { finalizeCaptureSession } from './finalize-capture-session';
import { storePendingReport, getPendingReport, dropPendingReport } from './pending-reports';
import { listCaptureSessions } from './list-sessions';
import { deleteSession } from './delete-session';
import { markSessionsSent } from './capture-manifest';

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

  handle('debug-report:send', async (_event, { reportId }): Promise<DebugReportUploadResult> => {
    const pendingReport = getPendingReport(reportId);
    if (!pendingReport) return { error: 'Report expired - package it again.' };
    const result = await uploadDebugReportZip(reportId, pendingReport.zip);
    if (!('error' in result)) {
      dropPendingReport(reportId);
      await markSessionsSent(pendingReport.profileId, pendingReport.sessionKeys, Date.now());
    }
    return result;
  });
};

export { registerDebugReportHandlers };
