/* @layer store-site @kind logic */
import type { RatingResponse } from '@rotp/hub-contracts';
import { storeApi } from '../store-client';

const unrateItem = (id: string) => storeApi.request<RatingResponse>('ratingDelete', { params: { id } });

export { unrateItem };
