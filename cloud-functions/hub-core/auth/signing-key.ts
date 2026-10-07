/* @layer hub-core @kind logic */
/** The HS256 key behind the session and state cookies, from SANCTUARY_SESSION_KEY.
 *  Rotating that secret signs everyone out and voids every in-flight OAuth state. */
import { createHash } from 'node:crypto';
import { readHubEnv } from '../env';

let cached: Uint8Array | null = null;

/** Hashed so any secret text yields a 32-byte key. */
const signingKey = (): Uint8Array => {
  if (!cached) cached = new Uint8Array(createHash('sha256').update(readHubEnv().SANCTUARY_SESSION_KEY).digest());
  return cached;
};

export { signingKey };
