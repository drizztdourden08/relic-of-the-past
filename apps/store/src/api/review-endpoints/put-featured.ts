/* @layer store-site @kind logic */
import type { FeaturedResponse } from '@shared/store/api-types';
import type { FeaturedBody } from '@shared/store/schemas';
import { storeApi } from '../store-client';

const putFeatured = (body: FeaturedBody) => storeApi.request<FeaturedResponse>('homeFeatured', { body });

export { putFeatured };
