/* @layer store-site @kind logic */
import type { FeaturedResponse } from '@rotp/hub-contracts';
import type { FeaturedBody } from '@rotp/hub-contracts';
import { storeApi } from '../store-client';

const putFeatured = (body: FeaturedBody) => storeApi.request<FeaturedResponse>('homeFeatured', { body });

export { putFeatured };
