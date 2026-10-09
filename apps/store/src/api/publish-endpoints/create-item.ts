/* @layer store-site @kind logic */
import type { ItemCreateResponse, ItemCreateBody } from '@rotp/hub-contracts';
import { storeApi } from '../store-client';

const createItem = (body: ItemCreateBody) => storeApi.request<ItemCreateResponse>('itemsCreate', { body });

export { createItem };
