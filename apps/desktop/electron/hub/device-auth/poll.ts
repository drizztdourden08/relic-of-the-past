/* @layer electron-main @kind logic */
import { HUB_LIMITS, HUB_ROUTES } from '@shared/hub';
import type { HubSignInResult } from '@shared/ipc';
import { callApi } from '../client';
import type { HubApi } from '../endpoints';
import { saveToken } from '../token-store';
import type { BeginResponse, PollResponse } from './device-auth.type';
import { sleep } from './sleep';

const poll = async (api: HubApi, begin: BeginResponse, signal: AbortSignal): Promise<HubSignInResult> => {
  const deadline = Date.now() + HUB_LIMITS.deviceCodeTtlMs;
  while (Date.now() < deadline) {
    await sleep(HUB_LIMITS.devicePollMs, signal);
    if (signal.aborted) return { ok: false, reason: 'cancelled' };
    const answer = await callApi<PollResponse>(api, {
      route: HUB_ROUTES.devicePoll,
      body: { deviceId: begin.deviceId, pollSecret: begin.pollSecret },
    });
    if (signal.aborted) return { ok: false, reason: 'cancelled' };
    if (answer.status === 'confirmed' && answer.token) {
      await saveToken(answer.token);
      return { ok: true };
    }
    if (answer.status === 'denied') return { ok: false, reason: 'denied' };
    if (answer.status === 'expired' || answer.status === 'used') return { ok: false, reason: 'expired' };
  }
  return { ok: false, reason: 'expired' };
};

export { poll };
