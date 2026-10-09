/* @layer electron-main @kind logic */
import { STORE_ROUTES } from '@shared/store/api-contract';
import type { ItemResponse } from '@shared/store/api-types';
import { callStore } from '../store-client';
import { assertItemId } from './assert-item-id';

const fetchItem = (itemId: string): Promise<ItemResponse> =>
  callStore<ItemResponse>({ route: STORE_ROUTES.itemsGet, params: { id: assertItemId(itemId) } });

export { fetchItem };
