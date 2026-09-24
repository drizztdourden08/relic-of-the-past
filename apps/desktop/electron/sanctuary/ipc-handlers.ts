/* @layer electron-main @kind logic */
import type { SanctuarySignInResult } from '@shared/ipc';
import { handle, emit } from '../lib/ipc/handle';
import { getMainWindow } from '../window';
import { beginDeviceSignIn, cancelDeviceSignIn } from './device-auth';
import { fetchMe } from './identity';
import { submitReport, uploadPendingZip } from './submit-report';
import { clearToken, canStore } from './token-store';

const sendDeviceCode = (userCode: string): void => {
  const window = getMainWindow();
  if (window) emit(window, 'sanctuary:deviceCode', userCode);
};

const registerSanctuaryHandlers = (): void => {
  handle('sanctuary:beginDeviceSignIn', async (): Promise<SanctuarySignInResult> => {
    if (!canStore()) {
      return { ok: false, reason: 'unavailable', message: 'This system cannot keep a sign-in encrypted.' };
    }
    return beginDeviceSignIn(sendDeviceCode);
  });

  handle('sanctuary:cancelDeviceSignIn', async () => { cancelDeviceSignIn(); });

  handle('sanctuary:signOut', async () => {
    cancelDeviceSignIn();
    await clearToken();
  });

  handle('sanctuary:me', async () => fetchMe());

  handle('sanctuary:submitReport', async (_event, input) => submitReport(input));

  handle('sanctuary:retryUpload', async (_event, { reportId }) => uploadPendingZip(reportId));
};

export { registerSanctuaryHandlers };
