/* @layer store-api @kind logic */
import { createHash } from 'node:crypto';
import type { Storage } from '@rotp/hub-server';

const hashObject = async (storage: Storage, key: string): Promise<string> => {
  const reader: ReadableStreamDefaultReader<unknown> = (await storage.readStream(key)).getReader();
  const hash = createHash('sha256');
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    hash.update(value as Uint8Array);
  }
  return hash.digest('hex');
};

export { hashObject };
