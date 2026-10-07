/* @layer store-api @kind logic */
/** Sets or removes one player's rating in one transaction: the item, the install and the
 *  previous rating are read inside it, so the item's totals always match its ratings.
 *  `stars` null removes the rating; removing one that is not there changes nothing. */
import type { Rating, Stars } from '../../../../shared/store/rating-types';
import type { ItemStats, StoreItem } from '../../../../shared/store/types';
import { notFound } from '../../../hub-core/http/http-error';
import { db, now } from '../../../hub-core/db/firestore';
import { itemsRepo } from '../db/items-repo';
import { installsRepo } from '../db/installs-repo';
import { ratingsRepo } from '../db/ratings-repo';
import type { Viewer } from '../items/project-item';
import { ratingRefusal } from './rating-rules';
import { statsAfter, statsFields } from './stats-after';

type RateResult = { stats: ItemStats; myRating: Stars | null };

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
export type { RateResult };
