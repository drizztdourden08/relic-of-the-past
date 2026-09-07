/* @layer electron-main @kind logic */
import { handle } from '../../lib/ipc/handle';
import type { DebugReportUploadResult } from '@shared/types/debug-report';
import { collectDebugReportFiles } from './collect-files';
import { buildDebugReportZip } from './build-zip';
import { uploadDebugReportZip } from './upload';

const registerDebugReportHandlers = (): void => {
  handle('debug-report:package', async (_event, input): Promise<DebugReportUploadResult> => {
    const files = await collectDebugReportFiles(input.profileId);
    const zip = await buildDebugReportZip(input, files);
    return uploadDebugReportZip(zip);
  });
};

export { registerDebugReportHandlers };
