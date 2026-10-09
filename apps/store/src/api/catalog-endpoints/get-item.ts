/* @layer store-site @kind logic */
import type { ItemResponse } from '@shared/store/api-types';
import { storeApi } from '../store-client';

const getItem = (id: string) => storeApi.request<ItemResponse>('itemsGet', { params: { id } });

export { getItem };
