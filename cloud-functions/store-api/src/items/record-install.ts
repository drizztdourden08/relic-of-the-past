/* @layer store-api @kind logic */
/** Records one download as an install, in one transaction. The install record is what a
 *  rating needs. An item counts a player once in its total and once per day toward Popular,
 *  so downloading again the same day moves neither; the author's own downloads count for
 *  neither. */
import type { Install } from '../../../../shared/store/rating-types';
import { db } from '../../../hub-core/db/firestore';
import { itemsRepo } from '../db/items-repo';
import { installsRepo } from '../db/installs-repo';
import { dailyRepo } from '../db/daily-repo';

type InstallInput = { itemId: string; userId: string; version: number; isAuthor: boolean; at: number };

const recordInstall = ({ itemId, userId, version, isAuthor, at }: InstallInput): Promise<void> =>
  db().runTransaction(async (tx) => {
    const ref = installsRepo.ref(itemId, userId);
    const snap = await tx.get(ref);
    const previous = snap.exists ? (snap.data() as Install) : null;
    const today = dailyRepo.dayKey(at);
    const install: Install = { itemId, userId, version, firstAt: previous?.firstAt ?? at, lastAt: at };
    tx.set(ref, install);
    if (isAuthor) return;
    if (!previous) tx.update(itemsRepo.ref(itemId), itemsRepo.bumpInstalls());
    if (!previous || dailyRepo.dayKey(previous.lastAt) !== today) {
      const { ref: dayRef, data } = dailyRepo.increment(today, itemId);
      tx.set(dayRef, data, { merge: true });
    }
  });

export { recordInstall };
