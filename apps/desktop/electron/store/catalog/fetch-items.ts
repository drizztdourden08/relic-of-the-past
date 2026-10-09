/* @layer electron-main @kind logic */
import { STORE_ROUTES } from '@shared/store/api-contract';
import type { ItemsListResponse } from '@shared/store/api-types';
import type { ItemCardView } from '@shared/store/home-types';
import type { StoreKind } from '@shared/store/types';
import { callStore } from '../store-client';
import { MAX_PAGES } from './catalog.constants';
import { isStoreKind } from './is-store-kind';

const fetchItems = async (kind: StoreKind | null): Promise<ItemCardView[]> => {
  if (kind !== null && !isStoreKind(kind)) throw new Error('Unknown kind of pack.');
  const items: ItemCardView[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const answer: ItemsListResponse = await callStore<ItemsListResponse>({
      route: STORE_ROUTES.itemsList,
      query: { kind, cursor },
    });
    items.push(...answer.items);
    cursor = answer.nextCursor;
    if (!cursor) break;
  }
  return items;
};

export { fetchItems };
