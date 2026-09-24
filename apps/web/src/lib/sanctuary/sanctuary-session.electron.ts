/* @layer renderer-lib @kind logic */
/** The Electron adapter of the session port: every call is one IPC channel. */
import type { SanctuarySession } from './sanctuary-session.type';

const electronSanctuarySession: SanctuarySession = {
  signIn: () => window.api.beginSanctuarySignIn(),
  cancel: () => window.api.cancelSanctuarySignIn(),
  signOut: () => window.api.sanctuarySignOut(),
  me: () => window.api.sanctuaryMe(),
  subscribeDeviceCode: (listener) => window.api.onSanctuaryDeviceCode(listener),
};

export { electronSanctuarySession };
