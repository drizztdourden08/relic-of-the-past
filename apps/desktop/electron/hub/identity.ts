/* @layer electron-main @kind logic */
import { HUB_ROUTES } from '@shared/hub';
import type { HubMe } from '@shared/ipc';
import { callApi, isApiError } from './client';
import type { HubApi } from './endpoints';
import { readToken, clearToken } from './token-store';
import { deviceLabel } from './device-auth';
import { UNAUTHORIZED } from './identity.constants';
import type { MeResponse } from './identity.type';

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
