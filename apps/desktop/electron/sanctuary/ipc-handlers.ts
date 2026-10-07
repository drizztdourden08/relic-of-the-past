/* @layer electron-main @kind logic */
/** The Sanctuary's own channels: filing a report and retrying its zip upload. Signing in is
 *  the shared account's (hub/ipc-handlers.ts). */
import { handle } from '../lib/ipc/handle';
import { submitReport, uploadPendingZip } from './submit-report';

const registerSanctuaryHandlers = (): void => {
  handle('sanctuary:submitReport', async (_event, input) => submitReport(input));

  handle('sanctuary:retryUpload', async (_event, { reportId }) => uploadPendingZip(reportId));
};

export { registerSanctuaryHandlers };
