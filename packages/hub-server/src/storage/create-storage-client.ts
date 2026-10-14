/* @layer hub-core @kind logic */
import { S3Client } from '@aws-sdk/client-s3';
import type { StorageClient, StorageConfig } from './create-storage.type';

const createStorageClient = (readConfig: () => StorageConfig): StorageClient => {
  let client: S3Client | null = null;

  const s3 = (): S3Client => {
    if (!client) {
      const { region, endpoint, keyId, appKey } = readConfig();
      client = new S3Client({ region, endpoint, credentials: { accessKeyId: keyId, secretAccessKey: appKey } });
    }
    return client;
  };

  const bucket = (): string => readConfig().bucket;

  return { s3, bucket };
};

export { createStorageClient };
