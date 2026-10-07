/* @layer renderer-lib @kind logic */
/** The Electron adapter of the session port: every call is one IPC channel. */
import type { HubSession } from './hub-session.type';

const electronHubSession: HubSession = {
  signIn: (site) => window.api.beginHubSignIn(site),
  cancel: () => window.api.cancelHubSignIn(),
  signOut: () => window.api.hubSignOut(),
  me: () => window.api.hubMe(),
  subscribeDeviceCode: (listener) => window.api.onHubDeviceCode(listener),
};

export { electronHubSession };
