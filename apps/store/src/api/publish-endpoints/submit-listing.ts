/* @layer store-site @kind logic */
import type { ItemChangeResponse } from '@shared/store/api-types';
import type { ListingPatchBody } from '@shared/store/schemas';
import { storeApi } from '../store-client';

const submitListing = (id: string, body: ListingPatchBody) =>
  storeApi.request<ItemChangeResponse>('itemsListing', { params: { id }, body });

export { submitListing };
