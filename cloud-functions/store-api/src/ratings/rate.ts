/* @layer store-api @kind logic */
import type { Rating, Stars } from '@rotp/hub-contracts';
import type { StoreItem } from '@rotp/hub-contracts';
import { notFound } from '@rotp/hub-server';
import { db, now } from '@rotp/hub-server';
import { itemsRepo } from '../db/items-repo';
import { installsRepo } from '../db/installs-repo';
import { ratingsRepo } from '../db/ratings-repo';
import type { Viewer } from '../items/project-item';
import type { RateResult } from './rate.type';
import { ratingRefusal } from './rating-rules';
import { statsAfter, statsFields } from './stats-after';

const rate = (itemId: string, viewer: Viewer, stars: Stars | null): Promise<RateResult> =>
  db().runTransaction(async (tx) => {
    const userId = viewer.caller.userId;
    const [itemSnap, installSnap, ratingSnap] = await tx.getAll(
      itemsRepo.ref(itemId),
      installsRepo.ref(itemId, userId),
      ratingsRepo.ref(itemId, userId),
    );
    if (!itemSnap.exists) throw notFound('No such item.');
    const item = itemSnap.data() as StoreItem;
    const previous = ratingSnap.exists ? (ratingSnap.data() as Rating).stars : null;
    if (stars === null && previous === null) return { stats: item.stats, myRating: null };
    const refusal = stars === null ? null : ratingRefusal(item, viewer, installSnap.exists);
    if (refusal) throw refusal;

    const totals = statsAfter(item.stats, previous, stars);
    if (stars === null) tx.delete(ratingsRepo.ref(itemId, userId));
    else tx.set(ratingsRepo.ref(itemId, userId), { itemId, userId, stars, at: now() } satisfies Rating);
    tx.update(itemsRepo.ref(itemId), statsFields(totals));
    return { stats: { ...item.stats, ...totals }, myRating: stars };
  });

export { rate };
