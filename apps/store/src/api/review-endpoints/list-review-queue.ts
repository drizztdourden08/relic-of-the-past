/* @layer store-site @kind logic */
import type { ReviewQueueResponse } from '@shared/store/api-types';
import { storeApi } from '../store-client';

const listReviewQueue = () => storeApi.request<ReviewQueueResponse>('reviewQueue');

export { listReviewQueue };
