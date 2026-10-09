/* @layer store-api @kind logic */
import { FieldValue } from '@google-cloud/firestore';
import { storeCollection } from './collections';
import { PRUNE_BATCH } from './daily-repo.constants';
import type { DailyCount } from './daily-repo.type';

const daily = () => storeCollection('daily');

const dayKey = (at: number): string => new Date(at).toISOString().slice(0, 10);

const ref = (day: string, itemId: string) => daily().doc(`${day}_${itemId}`);

const increment = (day: string, itemId: string) => ({
  ref: ref(day, itemId),
  data: { itemId, day, count: FieldValue.increment(1) },
});

const countsSince = async (fromDay: string): Promise<Map<string, number>> => {
  const snap = await daily().where('day', '>=', fromDay).get();
  const counts = new Map<string, number>();
  for (const doc of snap.docs) {
    const { itemId, count } = doc.data() as DailyCount;
    counts.set(itemId, (counts.get(itemId) ?? 0) + count);
  }
  return counts;
};

const pruneBefore = async (day: string): Promise<number> => {
  const snap = await daily().where('day', '<', day).limit(PRUNE_BATCH).get();
  const batch = daily().firestore.batch();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  if (snap.size > 0) await batch.commit();
  return snap.size;
};

const dailyRepo = { dayKey, increment, countsSince, pruneBefore };

export { dailyRepo };
