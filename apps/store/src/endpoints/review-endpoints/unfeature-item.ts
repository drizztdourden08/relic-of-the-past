/* @layer store-site @kind logic */
import type { ItemChangeResponse } from '@rotp/hub-contracts';
import { storeApi } from '../store-client';

const unfeatureItem = (id: string) => storeApi.request<ItemChangeResponse>('itemsUnfeature', { params: { id } });

export { unfeatureItem };
