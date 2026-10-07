/* @layer store-api @kind logic */
/** Installs per item per day, keyed `<day>_<itemId>` with the day as UTC `YYYY-MM-DD`. One
 *  document per item and day keeps writes to a busy item off a shared counter. The daily
 *  job sums the last 30 days into each item's installs30d and drops the older days. */
import { FieldValue } from '@google-cloud/firestore';
import { storeCollection } from './collections';

type DailyCount = { itemId: string; day: string; count: number };

const DAY_MS = 24 * 60 * 60 * 1000;
const PRUNE_BATCH = 400;

const daily = () => storeCollection('daily');

const dayKey = (at: number): string => new Date(at).toISOString().slice(0, 10);

const ref = (day: string, itemId: string) => daily().doc(`${day}_${itemId}`);

/** The write that counts one install, for use inside a transaction. */
const increment = (day: string, itemId: string) => ({
  ref: ref(day, itemId),
  data: { itemId, day, count: FieldValue.increment(1) },
});

/** Installs per item over every day from `fromDay` on. */
const countsSince = async (fromDay: string): Promise<Map<string, number>> => {
  const snap = await daily().where('day', '>=', fromDay).get();
  const counts = new Map<string, number>();
  for (const doc of snap.docs) {
    const { itemId, count } = doc.data() as DailyCount;
    counts.set(itemId, (counts.get(itemId) ?? 0) + count);
  }
  return counts;
};

/** Deletes the counters of every day before `day`; answers how many went. */
const pruneBefore = async (day: string): Promise<number> => {
  const snap = await daily().where('day', '<', day).limit(PRUNE_BATCH).get();
  const batch = daily().firestore.batch();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  if (snap.size > 0) await batch.commit();
  return snap.size;
};

const dailyRepo = { dayKey, increment, countsSince, pruneBefore };

export { dailyRepo, DAY_MS };
export type { DailyCount };
