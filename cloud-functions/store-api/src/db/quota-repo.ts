/* @layer store-api @kind logic */
/** The bytes one player downloads in a UTC day, keyed `<userId>_<day>`. The download count
 *  per day goes through hub-core's rate limiter; this holds the byte cap beside it, moved
 *  inside a transaction so two downloads cannot both slip under it. */
import { db } from '../../../hub-core/db/firestore';
import { storeCollection } from './collections';
import { dailyRepo } from './daily-repo';

type ByteQuota = { userId: string; day: string; bytes: number };

/** Adds `bytes` to today's total; answers false, and adds nothing, when it would pass `max`. */
const spendBytes = (userId: string, bytes: number, max: number, at: number): Promise<boolean> => {
  const day = dailyRepo.dayKey(at);
  const ref = storeCollection('quotas').doc(`${userId}_${day}`);
  return db().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const spent = snap.exists ? (snap.data() as ByteQuota).bytes : 0;
    if (spent + bytes > max) return false;
    tx.set(ref, { userId, day, bytes: spent + bytes });
    return true;
  });
};

const quotaRepo = { spendBytes };

export { quotaRepo };
