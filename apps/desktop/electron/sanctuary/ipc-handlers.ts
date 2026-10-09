/* @layer electron-main @kind logic */
import { handle } from '@drizztdourden08/brock-electron/main';
import { submitReport, uploadPendingZip } from './submit-report';

const registerSanctuaryHandlers = (): void => {
  handle('sanctuary:submitReport', async (_event, input) => submitReport(input));

  handle('sanctuary:retryUpload', async (_event, { reportId }) => uploadPendingZip(reportId));
};

export { registerSanctuaryHandlers };
