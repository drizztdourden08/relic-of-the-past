/* @layer electron-main @kind logic */
import { handle } from '../../lib/ipc/handle';
import type { DebugReportUploadResult } from '@shared/types/debug-report';
import { collectDebugReportFiles } from './collect-files';
import { buildDebugReportZip } from './build-zip';
import { uploadDebugReportZip } from './upload';

const registerDebugReportHandlers = (): void => {
  handle('debug-report:package', async (_event, input): Promise<DebugReportUploadResult> => {
    try {
      const files = await collectDebugReportFiles(input.profileId);
      const zip = await buildDebugReportZip(input, files);
      return await uploadDebugReportZip(zip);
    } catch (err) {
      return { error: err instanceof Error ? err.message : String(err) };
    }
  });
};

export { registerDebugReportHandlers };
