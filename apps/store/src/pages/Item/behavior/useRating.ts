/* @layer store-site @kind hook */
import { useCallback, useState } from 'react';
import type { ItemResponse, Stars } from '@rotp/hub-contracts';
import { errorMessage } from '@rotp/hub-client';
import { rateItem, unrateItem } from '../../../api/catalog-endpoints';
import type { UseRatingParams } from './useRating.type';

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
