/* @layer electron-main @kind logic */
import { randomUUID } from 'crypto';
import { app } from 'electron';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { handle } from '../../lib/ipc/handle';
import type { DebugReportBuildResult, DebugReportUploadResult } from '@shared/types/debug-report';
import { collectDebugReportFiles } from './collect-files';
import { buildDebugReportZip } from './build-zip';
import { uploadDebugReportZip } from './upload';
import { storePendingReport, getPendingReport, dropPendingReport } from './pending-reports';

// TEMPORARY: mirrors the --dump-nav/--dump-layers convention (debug-output/, gitignored) so a
// packaged report can be inspected before deciding whether to send it. Remove once done.
const dumpToDebugOutput = async (reportId: string, zip: Buffer): Promise<void> => {
  const appRoot = app.isPackaged ? join(app.getAppPath(), '../..') : join(__dirname, '../..');
  const dir = join(appRoot, 'debug-output');
  await mkdir(dir, { recursive: true });
  const outPath = join(dir, `debug-report-${reportId}.zip`);
  await writeFile(outPath, zip);
  console.log(`[debug-report] Written to: ${outPath}`);
};

const registerDebugReportHandlers = (): void => {
  handle('debug-report:build', async (_event, input): Promise<DebugReportBuildResult> => {
    try {
      const files = await collectDebugReportFiles(input.profileId);
      const zip = await buildDebugReportZip(input, files);
      const reportId = randomUUID().slice(0, 12);
      storePendingReport(reportId, zip);
      await dumpToDebugOutput(reportId, zip);
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
