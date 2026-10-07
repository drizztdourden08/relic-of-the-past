/* @layer store-api @kind logic */
/** The store's bucket, with its own key scoped to it: uploads under incoming/, approved
 *  packs under packs/, pictures under media/. Keys are spelled by shared/store/keys only. */
import { createStorage } from '../../../hub-core/storage/create-storage';
import { readStoreEnv } from '../env';

const storeBucket = createStorage(() => {
  const env = readStoreEnv();
  return { keyId: env.B2_STORE_KEY_ID, appKey: env.B2_STORE_APP_KEY, bucket: env.B2_STORE_BUCKET, endpoint: env.B2_ENDPOINT, region: env.B2_REGION };
});

export { storeBucket };
