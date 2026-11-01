/* @layer store-site @kind hook */
import type { ItemCardView } from '@rotp/hub-contracts';
import { listItems } from '../endpoints/catalog-endpoints';
import { useLoadedList } from '../loading/useLoadedList';
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

const useCatalog = () => useLoadedList(loadAll, NO_ITEMS).view;

export { useCatalog };
