/* @layer electron-main @kind logic */
import { handle } from '../../lib/ipc/handle';
import type { DebugReportBuildResult, DebugReportUploadResult } from '@shared/types/debug-report';
import { collectDebugReportFiles } from './collect-files';
import { buildDebugReportZip } from './build-zip';
import { uploadDebugReportZip } from './upload';
import { storePendingReport, getPendingReport, dropPendingReport } from './pending-reports';

const registerDebugReportHandlers = (): void => {
  handle('debug-report:build', async (_event, input): Promise<DebugReportBuildResult> => {
    try {
      const files = await collectDebugReportFiles(input.profileId);
      const zip = await buildDebugReportZip(input, files);
      return { token: storePendingReport(zip) };
    } catch (err) {
      return { error: err instanceof Error ? err.message : String(err) };
    }
  });

  handle('debug-report:send', async (_event, { token }): Promise<DebugReportUploadResult> => {
    const zip = getPendingReport(token);
    if (!zip) return { error: 'Report expired - package it again.' };
    const result = await uploadDebugReportZip(zip);
    if (!('error' in result)) dropPendingReport(token);
    return result;
  });
};

export { registerDebugReportHandlers };
