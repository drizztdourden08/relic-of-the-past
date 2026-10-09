/* @layer renderer-lib @kind logic */
import type { HubSession } from './hub-session.type';

const noHubSession: HubSession = {
  signIn: async () => ({ ok: false, reason: 'unavailable', message: 'Sign-in needs the desktop app.' }),
  cancel: async () => {},
  signOut: async () => {},
  me: async () => null,
  subscribeDeviceCode: () => () => {},
};

export { noHubSession };
