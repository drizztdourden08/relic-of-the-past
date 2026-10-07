/* @layer electron-main @kind logic */
/**
 * Who this device is signed in as: GET /me with the stored token. A 401 means the token was
 * revoked on the site or the device row is gone, so the token is dropped and the app reads
 * as signed out; any other failure (offline, 5xx) keeps the token and reports null for now.
 */
import { HUB_ROUTES } from '@shared/hub';
import type { Identity, SiteUser } from '@shared/hub';
import type { HubMe } from '@shared/ipc';
import { callApi, isApiError } from './client';
import type { HubApi } from './endpoints';
import { readToken, clearToken } from './token-store';
import { deviceLabel } from './device-auth';

type MeResponse = { user: SiteUser; identities: Identity[]; via: 'session' | 'device'; deviceId: string | null };

const UNAUTHORIZED = 401;

const fetchMe = async (api: HubApi): Promise<HubMe | null> => {
  const token = await readToken();
  if (!token) return null;
  try {
    const me = await callApi<MeResponse>(api, { route: HUB_ROUTES.me, token });
    return { user: me.user, identities: me.identities, deviceLabel: deviceLabel() };
  } catch (err) {
    if (isApiError(err) && err.status === UNAUTHORIZED) await clearToken();
    return null;
  }
};

export { fetchMe };
