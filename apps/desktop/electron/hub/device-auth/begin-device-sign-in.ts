/* @layer electron-main @kind logic */
import { shell } from 'electron';
import { HUB_ROUTES } from '@shared/hub';
import type { HubSignInResult } from '@shared/ipc';
import { callApi } from '../client';
import type { HubApi } from '../endpoints';
import type { BeginResponse } from './device-auth.type';
import { deviceLabel } from './device-label';
import { devicePlatform } from './device-platform';
import { poll } from './poll';
import { signInState } from './sign-in-state';

const beginDeviceSignIn = async (api: HubApi, onCode: (userCode: string) => void): Promise<HubSignInResult> => {
  signInState.cancelCurrent?.();
  const controller = new AbortController();
  const cancelThis = () => controller.abort();
  signInState.cancelCurrent = cancelThis;
  try {
    const begin = await callApi<BeginResponse>(api, {
      route: HUB_ROUTES.deviceBegin,
      body: { label: deviceLabel(), platform: devicePlatform() },
    });
    if (controller.signal.aborted) return { ok: false, reason: 'cancelled' };
    onCode(begin.userCode);
    await shell.openExternal(begin.verifyUrl);
    return await poll(api, begin, controller.signal);
  } catch (err) {
    if (controller.signal.aborted) return { ok: false, reason: 'cancelled' };
    return { ok: false, reason: 'error', message: err instanceof Error ? err.message : String(err) };
  } finally {
    const stillOwnsTheSlot = signInState.cancelCurrent === cancelThis;
    if (stillOwnsTheSlot) signInState.cancelCurrent = null;
  }
};

export { beginDeviceSignIn };
