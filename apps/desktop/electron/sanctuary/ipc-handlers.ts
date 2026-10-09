/* @layer electron-main @kind logic */
import { handle } from '../lib/ipc/handle';
import { submitReport, uploadPendingZip } from './submit-report';

const registerSanctuaryHandlers = (): void => {
  handle('sanctuary:submitReport', async (_event, input) => submitReport(input));

  handle('sanctuary:retryUpload', async (_event, { reportId }) => uploadPendingZip(reportId));
};

export { registerSanctuaryHandlers };
