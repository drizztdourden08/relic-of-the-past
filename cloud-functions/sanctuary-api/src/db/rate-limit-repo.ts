/* @layer root-config @kind logic */
/** Anonymous report quota per address: a fixed window and a count, moved
 *  forward inside one transaction so two bursts cannot both slip under it. */
import { LIMITS } from '../../../../shared/sanctuary';
import { collection, db, now } from './firestore';

type Window = { windowStart: number; count: number };

const WINDOW_MS = 10 * 60 * 1000;

const checkRateLimit = async (ip: string): Promise<boolean> => {
  const ref = collection('rateLimits').doc(ip);
  return db().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const at = now();
    const data = snap.exists ? (snap.data() as Window) : { windowStart: at, count: 0 };
    const withinWindow = at - data.windowStart < WINDOW_MS;
    const count = withinWindow ? data.count : 0;
    const windowStart = withinWindow ? data.windowStart : at;
    if (count >= LIMITS.anonymousReportsPer10Min) return false;
    tx.set(ref, { windowStart, count: count + 1 });
    return true;
  });
};

const rateLimitRepo = { checkRateLimit };

export { rateLimitRepo };
