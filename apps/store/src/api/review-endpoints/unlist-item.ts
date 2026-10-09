/* @layer store-site @kind logic */
import type { ItemChangeResponse } from '@shared/store/api-types';
import { storeApi } from '../store-client';

const unlistItem = (id: string) => storeApi.request<ItemChangeResponse>('itemsUnlist', { params: { id }, body: {} });

export { unlistItem };
