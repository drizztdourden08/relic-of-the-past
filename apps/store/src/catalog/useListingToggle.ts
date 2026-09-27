/* @layer store-site @kind hook */
/**
 * A reviewer's unlist and relist of one item. Unlisting hides a published item from the
 * catalogue and keeps its files; relisting shows it again. The API answers with the item.
 */
import { useCallback, useState } from 'react';
import type { StoreItem } from '@shared/store/types';
import { errorMessage } from '@site-kit/api/api-error';
import { relistItem, unlistItem } from '../api/review-endpoints';

const useListingToggle = (onItem: (item: StoreItem) => void) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (call: () => Promise<{ item: StoreItem }>) => {
    setBusy(true);
    setError(null);
    try {
      onItem((await call()).item);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }, [onItem]);

  const unlist = useCallback((id: string) => run(() => unlistItem(id)), [run]);
  const relist = useCallback((id: string) => run(() => relistItem(id)), [run]);

  return { busy, error, unlist, relist };
};

export { useListingToggle };
