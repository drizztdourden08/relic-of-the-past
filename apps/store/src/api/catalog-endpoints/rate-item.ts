/* @layer store-site @kind logic */
import type { Stars } from '@rotp/hub-contracts';
import type { RatingResponse } from '@rotp/hub-contracts';
import { storeApi } from '../store-client';

const rateItem = (id: string, stars: Stars) =>
  storeApi.request<RatingResponse>('ratingPut', { params: { id }, body: { stars } });

export { rateItem };
