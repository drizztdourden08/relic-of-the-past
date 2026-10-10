/* @layer store-site @kind hook */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ItemCardView } from '@rotp/hub-contracts';
import { errorMessage } from '@rotp/hub-client';
import { listItems } from '../endpoints/catalog-endpoints';
import { NO_ITEMS } from './catalog.constants';

const byName = (a: ItemCardView, b: ItemCardView) => a.name.localeCompare(b.name);

const loadAll = async (): Promise<ItemCardView[]> => {
  const all: ItemCardView[] = [];
  let cursor: string | null = null;
  do {
    const page = await listItems(cursor);
    all.push(...page.items);
    cursor = page.nextCursor;
  } while (cursor);
  return all.sort(byName);
};

const useCatalog = () => {
  const [items, setItems] = useState<ItemCardView[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setItems(await loadAll());
      setError(null);
    } catch (cause) {
      setError(errorMessage(cause));
      setItems([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return useMemo(
    () => ({ items: items ?? NO_ITEMS, loading: items === null, error, reload: load }),
    [items, error, load],
  );
};

export { useCatalog };
