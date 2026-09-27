/* @layer store-api @kind logic */
/** Typed view of the store's own settings: its origin and its bucket, with a key scoped to
 *  that bucket alone. The endpoint and region are the Backblaze account's, the same values
 *  the Sanctuary reads. The account settings every site shares are read by hub-core. Read
 *  lazily so a build or typecheck never needs the deploy environment. */
import { readRequired } from '../../hub-core/env';

type StoreEnv = {
  STORE_ORIGIN: string;
  B2_STORE_BUCKET: string;
  B2_STORE_KEY_ID: string;
  B2_STORE_APP_KEY: string;
  B2_ENDPOINT: string;
  B2_REGION: string;
};

const REQUIRED = ['STORE_ORIGIN', 'B2_STORE_BUCKET', 'B2_STORE_KEY_ID', 'B2_STORE_APP_KEY', 'B2_ENDPOINT', 'B2_REGION'] as const;

let cached: StoreEnv | null = null;

const readStoreEnv = (): StoreEnv => {
  if (!cached) cached = Object.fromEntries(REQUIRED.map((key) => [key, readRequired(key)])) as StoreEnv;
  return cached;
};

export { readStoreEnv };
export type { StoreEnv };
