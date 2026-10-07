/* @layer electron-main @kind logic */
/** The shared-account channels: device sign-in, cancel, sign out and who am I. The sign-in
 *  runs against the API of the site that asked, so the confirm page opens on that site; the
 *  token it yields serves every site. */
import type { SiteId } from '@shared/hub';
import type { HubSignInResult } from '@shared/ipc';
import { handle, emit } from '../lib/ipc/handle';
import { getMainWindow } from '../window';
import { beginDeviceSignIn, cancelDeviceSignIn } from './device-auth';
import { SANCTUARY_API, STORE_API } from './endpoints';
import type { HubApi } from './endpoints';
import { fetchMe } from './identity';
import { clearToken, canStore } from './token-store';

const SITE_APIS: Record<SiteId, HubApi> = { sanctuary: SANCTUARY_API, store: STORE_API };

/** The site's API; anything the renderer sends that is not a known site signs in to the Sanctuary. */
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
