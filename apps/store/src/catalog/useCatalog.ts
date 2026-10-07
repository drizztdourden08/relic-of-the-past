/* @layer store-site @kind hook */
/**
 * Every published item, loaded once by the signed-in frame, page after page until the API
 * has no next cursor. Browse, the kind pages, the search and the home page's kind shelves
 * all read this one list, so moving between them never fetches again.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ItemCardView } from '@shared/store/home-types';
import { errorMessage } from '@site-kit/api/api-error';
import { listItems } from '../api/catalog-endpoints';

const NO_ITEMS: ItemCardView[] = [];

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

type Catalog = ReturnType<typeof useCatalog>;

export { useCatalog };
export type { Catalog };
