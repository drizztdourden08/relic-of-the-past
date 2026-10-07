/* @layer electron-main @kind logic */
/**
 * One call to the store API as this device. The device token is read here and never leaves
 * the main process. No token, or a 401, reads as signed out so the Hookshop tab can show the
 * sign-in card; a 401 also drops the token, the same as the identity check does.
 */
import type { PathParams, RouteDef } from '@shared/hub';
import { callApi, isApiError } from '../hub/client';
import { STORE_API } from '../hub/endpoints';
import type { QueryParams } from '../hub/endpoints';
import { clearToken, readToken } from '../hub/token-store';

type StoreCall = { route: RouteDef; params?: PathParams; query?: QueryParams; body?: unknown };

type SignedOutError = Error & { signedOut: true };

const UNAUTHORIZED = 401;

const signedOutError = (message: string): SignedOutError =>
  Object.assign(new Error(message), { name: 'StoreSignedOut', signedOut: true as const });

const isSignedOut = (err: unknown): err is SignedOutError =>
  err instanceof Error && (err as { signedOut?: unknown }).signedOut === true;

const callStore = async <T>(call: StoreCall): Promise<T> => {
  const token = await readToken();
  if (!token) throw signedOutError('Sign in to use the Hookshop.');
  try {
    return await callApi<T>(STORE_API, { ...call, token });
  } catch (err) {
    if (isApiError(err) && err.status === UNAUTHORIZED) {
      await clearToken();
      throw signedOutError('This device was signed out on the site. Sign in again.');
    }
    throw err;
  }
};

export { callStore, isSignedOut };
export type { StoreCall };
