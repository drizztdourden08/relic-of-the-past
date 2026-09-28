/* @layer store-site @kind hook */
/**
 * A reviewer's delete of one approved version from the item page, asked once first. The file
 * leaves the store and the row stays in the author's history; deleting the live version hands
 * installs to the newest approved one left. The API answers with the item.
 */
import { useCallback, useState } from 'react';
import type { StoreItem, StoreVersion } from '@shared/store/types';
import { errorMessage } from '@site-kit/api/api-error';
import { deleteVersion } from '../../../api/publish-endpoints';

const useVersionDelete = (itemId: string, onItem: (item: StoreItem) => void) => {
  const [asking, setAsking] = useState<StoreVersion | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = useCallback(async () => {
    if (!asking) return;
    const { n } = asking;
    setAsking(null);
    setBusy(true);
    setError(null);
    try {
      onItem((await deleteVersion(itemId, n)).item);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }, [asking, itemId, onItem]);

  const cancel = useCallback(() => setAsking(null), []);

  return { asking, busy, error, ask: setAsking, confirm, cancel };
};

export { useVersionDelete };
