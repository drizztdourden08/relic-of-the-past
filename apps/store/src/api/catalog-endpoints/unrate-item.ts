/* @layer store-site @kind logic */
import type { RatingResponse } from '@shared/store/api-types';
import { storeApi } from '../store-client';

const unrateItem = (id: string) => storeApi.request<RatingResponse>('ratingDelete', { params: { id } });

export { unrateItem };
