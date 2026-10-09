/* @layer electron-main @kind logic */
import type { StoreResult } from '@app/ipc';
import { errorText } from './error-text';

const toStoreResult = async <T>(run: () => Promise<T>): Promise<StoreResult<T>> => {
  try {
    return { ok: true, data: await run() };
  } catch (err) {
    return { ok: false, error: errorText(err), signedOut: false };
  }
};

export { toStoreResult };
