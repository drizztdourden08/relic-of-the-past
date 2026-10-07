/* @layer store-api @kind logic */
/** The sha256 of a stored object, read as a stream so a large pack never sits in memory. */
import { createHash } from 'node:crypto';
import type { Storage } from '../../../hub-core/storage/create-storage';

const hashObject = async (storage: Storage, key: string): Promise<string> => {
  const reader = (await storage.readStream(key)).getReader();
  const hash = createHash('sha256');
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    hash.update(value as Uint8Array);
  }
  return hash.digest('hex');
};

export { hashObject };
