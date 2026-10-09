/* @layer store-site @kind logic */
import type { ItemChangeResponse } from '@shared/store/api-types';
import { storeApi } from '../store-client';

const relistItem = (id: string) => storeApi.request<ItemChangeResponse>('itemsRelist', { params: { id }, body: {} });

export { relistItem };
