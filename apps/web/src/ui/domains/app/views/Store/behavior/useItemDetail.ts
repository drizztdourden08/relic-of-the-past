/* @layer renderer-components @kind hook */
/**
 * The full record of the selected item, for the detail panel: its versions for the size and
 * its stats for the stars. An answer that arrives after the selection moved on is dropped.
 */
import { useEffect, useState } from 'react';
import type { ItemResponse } from '@shared/store/api-types';

const useItemDetail = (itemId: string | null, signedIn: boolean) => {
  const [detail, setDetail] = useState<ItemResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDetail(null);
    setError(null);
    if (!itemId || !signedIn) return undefined;
    let current = true;
    void window.api.storeItem(itemId).then((result) => {
      if (!current) return;
      if (result.ok) setDetail(result.data);
      else setError(result.error);
    });
    return () => { current = false; };
  }, [itemId, signedIn]);

  return { detail, detailError: error };
};

export { useItemDetail };
