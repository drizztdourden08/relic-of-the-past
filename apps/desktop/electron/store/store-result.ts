/* @layer electron-main @kind logic */
/** Wraps a store call into the answer every read channel gives: its data, or why not. */
import type { StoreResult } from '@shared/ipc';
import { isSignedOut } from './store-client';

const errorText = (err: unknown): string => (err instanceof Error ? err.message : String(err));

const toStoreResult = async <T>(run: () => Promise<T>): Promise<StoreResult<T>> => {
  try {
    return { ok: true, data: await run() };
  } catch (err) {
    return { ok: false, error: errorText(err), signedOut: isSignedOut(err) };
  }
};

export { toStoreResult, errorText };
