/* @layer electron-main @kind logic */
/**
 * The catalogue reads: the home page, every published item, one item. The API pages the
 * item list; this follows the cursor so the tab gets the whole list at once and searches it
 * locally, as the store site does. The item id and kind come from the renderer, so both are
 * checked before they reach a URL.
 */
import { STORE_ROUTES } from '@shared/store/api-contract';
import type { HomeResponse, ItemResponse, ItemsListResponse } from '@shared/store/api-types';
import { KIND_CONTAINER } from '@shared/store/containers';
import { isStoreDocId } from '@shared/store/deep-link';
import type { ItemCardView } from '@shared/store/home-types';
import type { StoreKind } from '@shared/store/types';
import { callStore } from './store-client';

/** A backstop against a cursor that never ends; far above the catalogue's size. */
const MAX_PAGES = 50;

const isStoreKind = (value: unknown): value is StoreKind =>
  typeof value === 'string' && Object.keys(KIND_CONTAINER).includes(value);

const assertItemId = (itemId: unknown): string => {
  if (typeof itemId !== 'string' || !isStoreDocId(itemId)) throw new Error('That is not a Hookshop item.');
  return itemId;
};

const fetchHome = (): Promise<HomeResponse> => callStore<HomeResponse>({ route: STORE_ROUTES.home });

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

const fetchItem = (itemId: string): Promise<ItemResponse> =>
  callStore<ItemResponse>({ route: STORE_ROUTES.itemsGet, params: { id: assertItemId(itemId) } });

export { fetchHome, fetchItems, fetchItem, assertItemId, isStoreKind };
