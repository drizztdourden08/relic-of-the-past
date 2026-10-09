/* @layer electron-main @kind logic */
import type { SignedOutError } from './store-client.type';

const isSignedOut = (err: unknown): err is SignedOutError =>
  err instanceof Error && (err as { signedOut?: unknown }).signedOut === true;

export { isSignedOut };
