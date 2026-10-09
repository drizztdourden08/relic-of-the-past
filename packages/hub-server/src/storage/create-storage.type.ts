/* @layer hub-core @kind types */
import type { createStorage } from './create-storage';

type StorageConfig = { keyId: string; appKey: string; bucket: string; endpoint: string; region: string };

type Storage = ReturnType<typeof createStorage>;

export type { Storage, StorageConfig };
