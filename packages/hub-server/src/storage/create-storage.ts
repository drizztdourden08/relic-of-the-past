/* @layer hub-core @kind logic */
import { createStorageClient } from './create-storage-client';
import type { StorageConfig } from './create-storage.type';
import { multipartOps } from './multipart-ops';
import { objectOps } from './object-ops';
import { signingOps } from './signing-ops';

const createStorage = (readConfig: () => StorageConfig) => {
  const client = createStorageClient(readConfig);
  return { ...multipartOps(client), ...signingOps(client), ...objectOps(client) };
};

export { createStorage };
export type { Storage } from './create-storage.type';
