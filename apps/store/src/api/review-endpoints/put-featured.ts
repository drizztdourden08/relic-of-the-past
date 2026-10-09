/* @layer store-site @kind logic */
import type { FeaturedResponse, FeaturedBody } from '@rotp/hub-contracts';
import { storeApi } from '../store-client';

const putFeatured = (body: FeaturedBody) => storeApi.request<FeaturedResponse>('homeFeatured', { body });

export { putFeatured };
