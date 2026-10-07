/* @layer store-site @kind hook */
/**
 * Everything the signed-in player published, with every version and its full review
 * record, loaded once by the frame. A create, an upload, a withdraw or a listing edit
 * answers with the item, which replaces its entry; no reload after a write.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { StoreItem } from '@shared/store/types';
import { errorMessage } from '@site-kit/api/api-error';
import { listPublications } from '../api/publish-endpoints';

const NO_ITEMS: StoreItem[] = [];

const byUpdated = (a: StoreItem, b: StoreItem) => b.updatedAt - a.updatedAt;

const usePublications = () => {
  const [items, setItems] = useState<StoreItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { items: rows } = await listPublications();
      setItems([...rows].sort(byUpdated));
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
    setItems((rows) => [item, ...(rows ?? []).filter((row) => row.id !== item.id)].sort(byUpdated));
  }, []);

  return useMemo(
    () => ({ items: items ?? NO_ITEMS, loading: items === null, error, reload: load, upsert }),
    [items, error, load, upsert],
  );
};

type Publications = ReturnType<typeof usePublications>;

export { usePublications };
export type { Publications };
