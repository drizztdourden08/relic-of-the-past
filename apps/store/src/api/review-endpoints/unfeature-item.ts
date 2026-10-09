/* @layer store-site @kind logic */
import type { ItemChangeResponse } from '@shared/store/api-types';
import { storeApi } from '../store-client';

const unfeatureItem = (id: string) => storeApi.request<ItemChangeResponse>('itemsUnfeature', { params: { id } });

export { unfeatureItem };
