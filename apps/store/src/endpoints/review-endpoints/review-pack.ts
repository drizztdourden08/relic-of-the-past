/* @layer store-site @kind logic */
import type { PackLinkResponse, ReviewTarget } from '@rotp/hub-contracts';
import { storeApi } from '../store-client';
import { reviewTargetParam } from './review-target-param';

const reviewPack = (itemId: string, target: ReviewTarget) =>
  storeApi.request<PackLinkResponse>('reviewPack', { params: { itemId, target: reviewTargetParam(target) } });

export { reviewPack };
