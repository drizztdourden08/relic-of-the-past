/* @layer store-site @kind hook */
/**
 * One item as the API shows this player: the item (projected to what they may see), their
 * own stars and whether they installed it. Fetched when the id changes; a rating or a
 * review action hands back what changed, which is merged in without a reload.
 */
import { useCallback, useEffect, useState } from 'react';
import type { ItemResponse } from '@shared/store/api-types';
import { errorMessage } from '@site-kit/api/api-error';
import { getItem } from '../api/catalog-endpoints';

const useItem = (id: string | null) => {
  const [data, setData] = useState<ItemResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setData(null);
    setError(null);
    if (!id) return undefined;
    let live = true;
    getItem(id).then(
      (response) => { if (live) setData(response); },
      (cause: unknown) => { if (live) setError(errorMessage(cause)); },
    );
    return () => { live = false; };
  }, [id]);

  const merge = useCallback((patch: Partial<ItemResponse>) => {
    setData((current) => (current ? { ...current, ...patch } : current));
  }, []);

  return { data, loading: Boolean(id) && data === null && error === null, error, merge };
};

type ItemState = ReturnType<typeof useItem>;

export { useItem };
export type { ItemState };
