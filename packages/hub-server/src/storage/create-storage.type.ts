/* @layer hub-core @kind types */
import type { S3Client } from '@aws-sdk/client-s3';
import type { createStorage } from './create-storage';

type StorageConfig = { keyId: string; appKey: string; bucket: string; endpoint: string; region: string };

type Storage = ReturnType<typeof createStorage>;

type StorageClient = { s3: () => S3Client; bucket: () => string };

export type { Storage, StorageClient, StorageConfig };
