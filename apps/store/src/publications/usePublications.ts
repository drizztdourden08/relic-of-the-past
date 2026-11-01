/* @layer store-site @kind hook */
import { useCallback, useMemo } from 'react';
import type { StoreItem } from '@rotp/hub-contracts';
import { useLoadedList } from '../loading/useLoadedList';
import { listPublications } from '../endpoints/publish-endpoints/list-publications';
import { NO_ITEMS } from './publications.constants';

const latestUpdateFirst = (a: StoreItem, b: StoreItem) => b.updatedAt - a.updatedAt;

const loadPublications = async (): Promise<StoreItem[]> => {
  const { items } = await listPublications();
  return [...items].sort(latestUpdateFirst);
};

const usePublications = () => {
  const { view, setItems } = useLoadedList(loadPublications, NO_ITEMS);

  const upsert = useCallback((item: StoreItem) => {
    setItems((rows) => [item, ...(rows ?? []).filter((row) => row.id !== item.id)].sort(latestUpdateFirst));
  }, [setItems]);

  return useMemo(() => ({ ...view, upsert }), [view, upsert]);
};

export { usePublications };
