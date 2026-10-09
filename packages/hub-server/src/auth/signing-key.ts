/* @layer hub-core @kind logic */
import { createHash } from 'node:crypto';
import { readHubEnv } from '../env';

let cached: Uint8Array | null = null;

const signingKey = (): Uint8Array => {
  if (!cached) cached = new Uint8Array(createHash('sha256').update(readHubEnv().SANCTUARY_SESSION_KEY).digest());
  return cached;
};

export { signingKey };
