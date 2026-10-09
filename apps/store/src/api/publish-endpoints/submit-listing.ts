/* @layer store-site @kind logic */
import type { ItemChangeResponse } from '@rotp/hub-contracts';
import type { ListingPatchBody } from '@rotp/hub-contracts';
import { storeApi } from '../store-client';

const submitListing = (id: string, body: ListingPatchBody) =>
  storeApi.request<ItemChangeResponse>('itemsListing', { params: { id }, body });

export { submitListing };
