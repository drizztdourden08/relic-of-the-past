/* @layer electron-main @kind logic */
/**
 * Who this device is signed in as: GET /me with the stored token. A 401 means the token was
 * revoked on the site or the device row is gone, so the token is dropped and the app reads
 * as signed out; any other failure (offline, 5xx) keeps the token and reports null for now.
 */
import type { Identity, SanctuaryUser } from '@shared/sanctuary';
import type { SanctuaryMe } from '@shared/ipc';
import { callApi, isApiError } from './client';
import { readToken, clearToken } from './token-store';
import { deviceLabel } from './device-auth';

type MeResponse = { user: SanctuaryUser; identities: Identity[]; via: 'session' | 'device'; deviceId: string | null };

const UNAUTHORIZED = 401;

const fetchMe = async (): Promise<SanctuaryMe | null> => {
  const token = await readToken();
  if (!token) return null;
  try {
    const me = await callApi<MeResponse>({ route: 'me', token });
    return { user: me.user, identities: me.identities, deviceLabel: deviceLabel() };
  } catch (err) {
    if (isApiError(err) && err.status === UNAUTHORIZED) await clearToken();
    return null;
  }
};

export { fetchMe };
