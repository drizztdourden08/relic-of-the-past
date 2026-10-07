/* @layer electron-main @kind logic */
/**
 * The device-code sign-in. Begin asks the API for a short user code, hands the code to the
 * renderer, opens the site on the confirm page and polls until the person confirmed (a token
 * comes back once), denied, or the code expired. One sign-in runs at a time; cancel ends it.
 */
import { shell } from 'electron';
import { hostname } from 'os';
import { HUB_LIMITS, HUB_ROUTES } from '@shared/hub';
import type { DevicePlatform } from '@shared/hub';
import type { HubSignInResult } from '@shared/ipc';
import { callApi } from './client';
import type { HubApi } from './endpoints';
import { saveToken } from './token-store';

type BeginResponse = { deviceId: string; userCode: string; verifyUrl: string; pollSecret: string };
type PollResponse = { status: 'pending' | 'confirmed' | 'denied' | 'expired' | 'used'; token?: string };

const PLATFORM_LABELS: Record<DevicePlatform, string> = {
  windows: 'Windows',
  linux: 'Linux',
  mac: 'macOS',
  android: 'Android',
};

const devicePlatform = (): DevicePlatform =>
  process.platform === 'win32' ? 'windows' : process.platform === 'darwin' ? 'mac' : 'linux';

/** "Windows · DESKTOP-4F2", what the site shows on the confirm page and the devices list. */
const deviceLabel = (): string => `${PLATFORM_LABELS[devicePlatform()]} · ${hostname()}`;

let cancelCurrent: (() => void) | null = null;

const sleep = (ms: number, signal: AbortSignal): Promise<void> =>
  new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => { clearTimeout(timer); resolve(); }, { once: true });
  });

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

const beginDeviceSignIn = async (api: HubApi, onCode: (userCode: string) => void): Promise<HubSignInResult> => {
  cancelCurrent?.();
  const controller = new AbortController();
  const cancelThis = () => controller.abort();
  cancelCurrent = cancelThis;
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
    // A newer begin may already own the slot; only this run clears its own handle.
    if (cancelCurrent === cancelThis) cancelCurrent = null;
  }
};

const cancelDeviceSignIn = (): void => {
  cancelCurrent?.();
  cancelCurrent = null;
};

export { beginDeviceSignIn, cancelDeviceSignIn, deviceLabel, devicePlatform };
