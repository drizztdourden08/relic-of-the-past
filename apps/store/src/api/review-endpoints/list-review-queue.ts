/* @layer store-site @kind logic */
import type { ReviewQueueResponse } from '@rotp/hub-contracts';
import { storeApi } from '../store-client';

const listReviewQueue = () => storeApi.request<ReviewQueueResponse>('reviewQueue');

export { listReviewQueue };
