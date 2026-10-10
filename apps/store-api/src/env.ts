/* @layer store-api @kind logic */
import { readRequired } from '@rotp/hub-server';
import { REQUIRED_STORE_ENV } from './env.constants';
import type { StoreEnv } from './env.type';

let cached: StoreEnv | null = null;

const readStoreEnv = (): StoreEnv => {
  cached ??= Object.fromEntries(REQUIRED_STORE_ENV.map((key) => [key, readRequired(key)])) as StoreEnv;
  return cached;
};

export { readStoreEnv };
