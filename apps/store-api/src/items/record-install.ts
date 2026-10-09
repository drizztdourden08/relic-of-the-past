/* @layer store-api @kind logic */
import type { Install } from '@rotp/hub-contracts';
import { db } from '@rotp/hub-server';
import { itemsRepo } from '../db/items-repo';
import { installsRepo } from '../db/installs-repo';
import { dailyRepo } from '../db/daily-repo';
import type { InstallInput } from './record-install.type';

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
