/* @layer store-site @kind logic */
import type { Stars } from '@shared/store/rating-types';
import type { RatingResponse } from '@shared/store/api-types';
import { storeApi } from '../store-client';

const rateItem = (id: string, stars: Stars) =>
  storeApi.request<RatingResponse>('ratingPut', { params: { id }, body: { stars } });

export { rateItem };
