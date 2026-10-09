/* @layer renderer-lib @kind logic */
import { appApi } from '@app/ipc/app-api';
import type { HubSession } from './hub-session.type';
import { electronHubSession } from './hub-session.electron';
import { noHubSession } from './hub-session.none';

let cached: HubSession | null = null;

const hostHasHubChannels = (): boolean => typeof appApi()?.beginHubSignIn === 'function';

const getHubSession = (): HubSession => {
  if (!cached) cached = hostHasHubChannels() ? electronHubSession : noHubSession;
  return cached;
};

export { getHubSession };
export type { HubSession };
