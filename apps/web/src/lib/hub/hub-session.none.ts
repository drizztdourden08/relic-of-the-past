/* @layer renderer-lib @kind logic */
/** The session port on a host with no main process (web, mobile): always signed out. */
import type { HubSession } from './hub-session.type';

const noHubSession: HubSession = {
  signIn: async () => ({ ok: false, reason: 'unavailable', message: 'Sign-in needs the desktop app.' }),
  cancel: async () => {},
  signOut: async () => {},
  me: async () => null,
  subscribeDeviceCode: () => () => {},
};

export { noHubSession };
