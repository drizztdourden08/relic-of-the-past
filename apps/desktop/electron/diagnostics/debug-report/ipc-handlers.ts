/* @layer electron-main @kind logic */
import { randomUUID } from 'crypto';
import { handle } from '../../lib/ipc/handle';
import type {
  DebugCaptureFinalizeResult, DebugReportBuildResult, DebugReportUploadResult,
} from '@shared/types/debug-report';
import { collectDebugReportFiles } from './collect-files';
import { collectCaptureSessions, deleteCaptureSessions } from './collect-capture-sessions';
import { buildDebugReportZip } from './build-zip';
import { uploadDebugReportZip } from './upload';
import { finalizeCaptureSession } from './finalize-capture-session';
import { storePendingReport, getPendingReport, dropPendingReport } from './pending-reports';

const registerDebugReportHandlers = (): void => {
  handle('debug-capture:finalizeSession', async (_event, input): Promise<DebugCaptureFinalizeResult> =>
    finalizeCaptureSession(input));

  handle('debug-report:build', async (_event, input): Promise<DebugReportBuildResult> => {
    try {
      const [files, captureSessions] = await Promise.all([
        collectDebugReportFiles(input.profileId),
        collectCaptureSessions(input.profileId),
      ]);
      const zip = await buildDebugReportZip(input, files, captureSessions);
      const reportId = randomUUID().slice(0, 12);
      storePendingReport(reportId, zip);
      await deleteCaptureSessions(input.profileId, captureSessions.map((s) => s.sessionKey));
      return { reportId };
    } catch (err) {
      return { error: err instanceof Error ? err.message : String(err) };
    }
  });

  handle('debug-report:send', async (_event, { reportId }): Promise<DebugReportUploadResult> => {
    const zip = getPendingReport(reportId);
    if (!zip) return { error: 'Report expired - package it again.' };
    const result = await uploadDebugReportZip(reportId, zip);
    if (!('error' in result)) dropPendingReport(reportId);
    return result;
  });
};

export { registerDebugReportHandlers };
