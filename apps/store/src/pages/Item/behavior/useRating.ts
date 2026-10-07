/* @layer store-site @kind hook */
/**
 * The player's stars on one item: whether they may rate it (installed it, and not their
 * own), and setting or removing their stars. The API answers with the new stats, which are
 * merged into the item without a reload.
 */
import { useCallback, useState } from 'react';
import type { ItemResponse } from '@shared/store/api-types';
import type { Stars } from '@shared/store/rating-types';
import { errorMessage } from '@site-kit/api/api-error';
import { rateItem, unrateItem } from '../../../api/catalog-endpoints';

type UseRatingParams = {
  data: ItemResponse | null;
  meId: string;
  merge: (patch: Partial<ItemResponse>) => void;
};

const blockedReasonOf = (data: ItemResponse | null, meId: string): string | null => {
  if (!data) return 'Loading...';
  if (data.item.author.userId === meId) return 'You cannot rate your own item.';
  if (!data.installed) return 'Install it first, then come back to rate it.';
  return null;
};

const useRating = (params: UseRatingParams) => {
  const { data, meId, merge } = params;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const itemId = data?.item.id ?? null;

  const run = useCallback(async (call: () => ReturnType<typeof rateItem>) => {
    if (!data) return;
    setBusy(true);
    setError(null);
    try {
      const { stats, myRating } = await call();
      merge({ item: { ...data.item, stats }, myRating });
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }, [data, merge]);

  const rate = useCallback((stars: Stars) => { if (itemId) void run(() => rateItem(itemId, stars)); }, [itemId, run]);
  const clear = useCallback(() => { if (itemId) void run(() => unrateItem(itemId)); }, [itemId, run]);

  return { blockedReason: blockedReasonOf(data, meId), busy, error, rate, clear };
};

export { useRating };
