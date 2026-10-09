/* @layer renderer-lib @kind logic */
import { appApi } from '@app/ipc/app-api';
import type { HubSession } from './hub-session.type';

const electronHubSession: HubSession = {
  signIn: (site) => appApi().beginHubSignIn(site),
  cancel: () => appApi().cancelHubSignIn(),
  signOut: () => appApi().hubSignOut(),
  me: () => appApi().hubMe(),
  subscribeDeviceCode: (listener) => appApi().onHubDeviceCode(listener),
};

export { electronHubSession };
