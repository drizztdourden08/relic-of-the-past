/* @layer electron-main @kind logic */
import { HUB_LIMITS, HUB_ROUTES } from '@rotp/hub-contracts';
import type { SiteId } from '@rotp/hub-contracts';
import type { SignInBegin, SignInPoll, SignInProvider } from '@drizztdourden08/brock-secrets/main';
import { callApi } from '../client';
import { deviceLabel, devicePlatform } from '../device';
import { SITE_APIS } from '../ipc-handlers.constants';
import { canStore, saveToken } from '../token-store';
import { CANNOT_STORE_ERROR } from './sign-in.constants';
import type { BeginResponse } from './sign-in.type';

const hubSignInProvider = (site: SiteId): SignInProvider => {
  const api = SITE_APIS[site];

  const begin = async (): Promise<SignInBegin> => {
    if (!canStore()) throw new Error(CANNOT_STORE_ERROR);
    const begun = await callApi<BeginResponse>(api, {
      route: HUB_ROUTES.deviceBegin,
      body: { label: deviceLabel(), platform: devicePlatform() },
    });
    return { id: begun.deviceId, userCode: begun.userCode, verifyUrl: begun.verifyUrl, pollSecret: begun.pollSecret };
  };

  const poll = (deviceId: string, pollSecret: string): Promise<SignInPoll> =>
    callApi<SignInPoll>(api, { route: HUB_ROUTES.devicePoll, body: { deviceId, pollSecret } });

  return { id: site, begin, poll, onToken: saveToken, pollMs: HUB_LIMITS.devicePollMs, ttlMs: HUB_LIMITS.deviceCodeTtlMs };
};

export { hubSignInProvider };
