/* @layer store-api @kind logic */
import type { Rating, Stars } from '@rotp/hub-contracts';
import { pairId, storeCollection } from './collections';

const ratings = () => storeCollection('ratings');

const ref = (itemId: string, userId: string) => ratings().doc(pairId(itemId, userId));

const starsOf = async (itemId: string, userId: string): Promise<Stars | null> => {
  const snap = await ref(itemId, userId).get();
  return snap.exists ? (snap.data() as Rating).stars : null;
};

const ratingsRepo = { ref, starsOf };

export { ratingsRepo };
