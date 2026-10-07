/* @layer store-site @kind logic */
/**
 * What the review and feature permissions call: the queue and the versions not submitted
 * yet, a decision on a version or a listing edit, a link to read a version's pack,
 * unlisting and relisting an item, and the home page's featured row and welcome.
 */
import type {
  FeaturedResponse,
  ItemChangeResponse,
  PackLinkResponse,
  ReviewQueueResponse,
  ReviewTarget,
  UnsubmittedResponse,
  WelcomeResponse,
} from '@shared/store/api-types';
import type { FeaturedBody, ReviewDecideBody, WelcomeBody } from '@shared/store/schemas';
import { storeApi } from './store-client';

/** The `:target` segment: `v<n>` for a version, the edit's id for a listing edit. */
const reviewTargetParam = (target: ReviewTarget): string =>
  (target.kind === 'version' ? `v${target.n}` : target.editId);

const listReviewQueue = () => storeApi.request<ReviewQueueResponse>('reviewQueue');

/** The ready versions no author has sent for review yet. */
const listUnsubmitted = () => storeApi.request<UnsubmittedResponse>('reviewUnsubmitted');

const decideReview = (itemId: string, target: ReviewTarget, body: ReviewDecideBody) =>
  storeApi.request<ItemChangeResponse>('reviewDecide', { params: { itemId, target: reviewTargetParam(target) }, body });

/** An inline signed link to a version's pack, for reading it in parts. */
const reviewPack = (itemId: string, target: ReviewTarget) =>
  storeApi.request<PackLinkResponse>('reviewPack', { params: { itemId, target: reviewTargetParam(target) } });

const unlistItem =(id: string) => storeApi.request<ItemChangeResponse>('itemsUnlist', { params: { id }, body: {} });

const relistItem = (id: string) => storeApi.request<ItemChangeResponse>('itemsRelist', { params: { id }, body: {} });

const putFeatured = (body: FeaturedBody) => storeApi.request<FeaturedResponse>('homeFeatured', { body });

/** Adds a published item to the end of the featured row. */
const featureItem = (id: string) => storeApi.request<ItemChangeResponse>('itemsFeature', { params: { id }, body: {} });

const unfeatureItem = (id: string) => storeApi.request<ItemChangeResponse>('itemsUnfeature', { params: { id } });

const putWelcome = (body: WelcomeBody) => storeApi.request<WelcomeResponse>('homeWelcome', { body });

export {
  reviewTargetParam, listReviewQueue, listUnsubmitted, decideReview, reviewPack, unlistItem, relistItem, putFeatured, featureItem, unfeatureItem,
  putWelcome,
};
