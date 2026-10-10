/* @layer store-site @kind hook */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { StoreItem } from '@rotp/hub-contracts';
import { errorMessage } from '@rotp/hub-client';
import { listPublications } from '../endpoints/publish-endpoints/list-publications';
import { NO_ITEMS } from './publications.constants';

const latestUpdateFirst = (a: StoreItem, b: StoreItem) => b.updatedAt - a.updatedAt;

const usePublications = () => {
  const [items, setItems] = useState<StoreItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { items: rows } = await listPublications();
      setItems([...rows].sort(latestUpdateFirst));
      setError(null);
    } catch (cause) {
      setError(errorMessage(cause));
      setItems([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const upsert = useCallback((item: StoreItem) => {
    setItems((rows) => [item, ...(rows ?? []).filter((row) => row.id !== item.id)].sort(latestUpdateFirst));
  }, []);

  return useMemo(
    () => ({ items: items ?? NO_ITEMS, loading: items === null, error, reload: load, upsert }),
    [items, error, load, upsert],
  );
};

export { usePublications };
