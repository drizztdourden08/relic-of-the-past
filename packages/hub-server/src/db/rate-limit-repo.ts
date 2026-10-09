/* @layer hub-core @kind logic */
import { collection, db, now } from './firestore';
import type { RateLimitWindow } from './rate-limit-repo.type';

const checkRateLimit = async (key: string, max: number, windowMs: number): Promise<boolean> => {
  const ref = collection('rateLimits').doc(key);
  return db().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const at = now();
    const data = snap.exists ? (snap.data() as RateLimitWindow) : { windowStart: at, count: 0 };
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
