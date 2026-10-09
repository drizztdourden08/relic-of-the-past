/* @layer store-site @kind logic */
import type { ItemChangeResponse } from '@shared/store/api-types';
import { storeApi } from '../store-client';

const featureItem = (id: string) => storeApi.request<ItemChangeResponse>('itemsFeature', { params: { id }, body: {} });

export { featureItem };
