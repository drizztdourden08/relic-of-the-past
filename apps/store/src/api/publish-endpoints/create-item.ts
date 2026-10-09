/* @layer store-site @kind logic */
import type { ItemCreateResponse } from '@shared/store/api-types';
import type { ItemCreateBody } from '@shared/store/schemas';
import { storeApi } from '../store-client';

const createItem = (body: ItemCreateBody) => storeApi.request<ItemCreateResponse>('itemsCreate', { body });

export { createItem };
