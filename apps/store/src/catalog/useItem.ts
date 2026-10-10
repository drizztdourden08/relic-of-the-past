/* @layer store-site @kind hook */
import { useCallback, useEffect, useState } from 'react';
import type { ItemResponse } from '@rotp/hub-contracts';
import { errorMessage } from '@rotp/hub-client';
import { getItem } from '../endpoints/catalog-endpoints';

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

export { useItem };
export type { ItemState } from './item.type';
