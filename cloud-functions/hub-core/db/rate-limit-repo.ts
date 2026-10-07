/* @layer hub-core @kind logic */
/** A quota per key: a fixed window and a count, moved forward inside one transaction so
 *  two bursts cannot both slip under it. The key names what is counted (an address, a
 *  user and a scope); the caller picks the cap and the window. */
import { collection, db, now } from './firestore';

type Window = { windowStart: number; count: number };

/** Counts one more hit on `key`; answers false, and counts nothing, once `max` is reached. */
const checkRateLimit = async (key: string, max: number, windowMs: number): Promise<boolean> => {
  const ref = collection('rateLimits').doc(key);
  return db().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const at = now();
    const data = snap.exists ? (snap.data() as Window) : { windowStart: at, count: 0 };
    const withinWindow = at - data.windowStart < windowMs;
    const count = withinWindow ? data.count : 0;
    const windowStart = withinWindow ? data.windowStart : at;
    if (count >= max) return false;
    tx.set(ref, { windowStart, count: count + 1 });
    return true;
  });
};

const rateLimitRepo = { checkRateLimit };

export { rateLimitRepo };
