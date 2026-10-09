/* @layer store-site @kind logic */
import type { ItemResponse } from '@rotp/hub-contracts';
import { storeApi } from '../store-client';

const getItem = (id: string) => storeApi.request<ItemResponse>('itemsGet', { params: { id } });

export { getItem };
