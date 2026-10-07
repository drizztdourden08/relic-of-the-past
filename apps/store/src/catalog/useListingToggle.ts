/* @layer store-site @kind hook */
/**
 * What staff change on one item from its page: a reviewer's unlist and relist (unlisting
 * hides a published item from the catalogue and keeps its files), and a curator's feature
 * and unfeature on the home page's featured row. The API answers with the item.
 */
import { useCallback, useState } from 'react';
import type { StoreItem } from '@shared/store/types';
import { errorMessage } from '@site-kit/api/api-error';
import { featureItem, relistItem, unfeatureItem, unlistItem } from '../api/review-endpoints';

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
  const feature = useCallback((id: string) => run(() => featureItem(id)), [run]);
  const unfeature = useCallback((id: string) => run(() => unfeatureItem(id)), [run]);

  return { busy, error, unlist, relist, feature, unfeature };
};

export { useListingToggle };
