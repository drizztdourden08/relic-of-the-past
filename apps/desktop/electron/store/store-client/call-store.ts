/* @layer electron-main @kind logic */
import { callApi, isApiError } from '../../hub/client';
import { STORE_API } from '../../hub/endpoints';
import { clearToken, readToken } from '../../hub/token-store';
import { UNAUTHORIZED } from './store-client.constants';
import type { StoreCall } from './store-client.type';
import { signedOutError } from './signed-out-error';

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

export { callStore };
