/* @layer root-config @kind logic */
import { createStorage } from '@rotp/hub-server';
import { readSanctuaryEnv } from '../env';

const filesBucket = createStorage(() => {
  const env = readSanctuaryEnv();
  return { keyId: env.B2_KEY_ID, appKey: env.B2_APP_KEY, bucket: env.B2_BUCKET, endpoint: env.B2_ENDPOINT, region: env.B2_REGION };
});

export { filesBucket };
