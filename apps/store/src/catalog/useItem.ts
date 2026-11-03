/* @layer store-site @kind hook */
import { useCallback } from 'react';
import type { ItemResponse } from '@rotp/hub-contracts';
import { getItem } from '../endpoints/catalog-endpoints';
import { useRemote } from '../loading/useRemote';

const useItem = (id: string | null) => {
  const { data, error, setData } = useRemote(id === '' ? null : id, getItem);

  const merge = useCallback((patch: Partial<ItemResponse>) => {
    setData((current) => (current ? { ...current, ...patch } : current));
  }, [setData]);

  return { data, loading: Boolean(id) && data === null && error === null, error, merge };
};

export { useItem };
