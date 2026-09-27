/* @layer store-api @kind logic */
/** Ratings, one per player per item, keyed `<itemId>_<userId>`. Writes go through the
 *  rating transaction, which moves the item's totals with them. */
import type { Rating, Stars } from '../../../../shared/store/rating-types';
import { pairId, storeCollection } from './collections';

const ratings = () => storeCollection('ratings');

const ref = (itemId: string, userId: string) => ratings().doc(pairId(itemId, userId));

/** The caller's stars on this item, or null. */
const starsOf = async (itemId: string, userId: string): Promise<Stars | null> => {
  const snap = await ref(itemId, userId).get();
  return snap.exists ? (snap.data() as Rating).stars : null;
};

const ratingsRepo = { ref, starsOf };

export { ratingsRepo };
