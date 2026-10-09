/* @layer electron-main @kind logic */
import type { SignedOutError } from './store-client.type';

const signedOutError = (message: string): SignedOutError =>
  Object.assign(new Error(message), { name: 'StoreSignedOut', signedOut: true as const });

export { signedOutError };
