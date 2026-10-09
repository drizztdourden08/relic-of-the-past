/* @layer store-api @kind logic */
import { db } from '../../../hub-core/db/firestore';
import { storeCollection } from './collections';
import { dailyRepo } from './daily-repo';
import type { ByteQuota } from './quota-repo.type';

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
