/* @layer electron-main @kind logic */
import type { SiteId } from '@shared/hub';
import type { HubSignInResult } from '@shared/ipc';
import { handle, emit, getMainWindow } from '@drizztdourden08/brock-electron/main';
import { beginDeviceSignIn, cancelDeviceSignIn } from './device-auth';
import { SANCTUARY_API } from './endpoints';
import type { HubApi } from './endpoints';
import { fetchMe } from './identity';
import { SITE_APIS } from './ipc-handlers.constants';
import { clearToken, canStore } from './token-store';

const apiForSite = (site: SiteId | undefined): HubApi =>
  site === 'store' ? SITE_APIS.store : SITE_APIS.sanctuary;

const sendDeviceCode = (userCode: string): void => {
  const window = getMainWindow();
  if (window) emit(window, 'hub:deviceCode', userCode);
};

const registerHubHandlers = (): void => {
  handle('hub:beginDeviceSignIn', async (_event, site): Promise<HubSignInResult> => {
    if (!canStore()) {
      return { ok: false, reason: 'unavailable', message: 'This system cannot keep a sign-in encrypted.' };
    }
    return beginDeviceSignIn(apiForSite(site), sendDeviceCode);
  });

  handle('hub:cancelDeviceSignIn', async () => { cancelDeviceSignIn(); });

  handle('hub:signOut', async () => {
    cancelDeviceSignIn();
    await clearToken();
  });

  handle('hub:me', async () => fetchMe(SANCTUARY_API));
};

export { registerHubHandlers };
