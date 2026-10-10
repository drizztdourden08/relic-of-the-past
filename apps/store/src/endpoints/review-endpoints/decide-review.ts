/* @layer store-site @kind logic */
import type { ItemChangeResponse, ReviewTarget, ReviewDecideBody } from '@rotp/hub-contracts';
import { storeApi } from '../store-client';
import { reviewTargetParam } from './review-target-param';

const decideReview = (itemId: string, target: ReviewTarget, body: ReviewDecideBody) =>
  storeApi.request<ItemChangeResponse>('reviewDecide', { params: { itemId, target: reviewTargetParam(target) }, body });

export { decideReview };
