/* @layer store-api @kind logic */
import { createStorage } from '@rotp/hub-server';
import { readStoreEnv } from '../env';

const storeBucket = createStorage(() => {
  const env = readStoreEnv();
  return { keyId: env.B2_STORE_KEY_ID, appKey: env.B2_STORE_APP_KEY, bucket: env.B2_STORE_BUCKET, endpoint: env.B2_ENDPOINT, region: env.B2_REGION };
});

export { storeBucket };
