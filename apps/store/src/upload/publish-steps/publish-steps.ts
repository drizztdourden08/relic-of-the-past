/* @layer store-site @kind logic */
import { fileSteps, stepOf } from '@rotp/hub-client';
import type { UploadStep } from '@rotp/hub-client';
import type { PublishTarget } from '../publish-target.type';
import { PACK_LABELS, STORE_STEP } from './publish-steps.constants';
import { hasListingPatch } from './has-listing-patch';
import { hasPictures } from './has-pictures';

const listingSteps = (target: PublishTarget): UploadStep[] => {
  const pictures = hasPictures(target) ? [stepOf(STORE_STEP.pictures, 'Pictures uploaded')] : [];
  if (target.isNew) return [stepOf(STORE_STEP.listing, 'Listing created'), ...pictures];
  const listing = hasListingPatch(target) || hasPictures(target) ? [stepOf(STORE_STEP.listing, 'Listing sent')] : [];
  return [...pictures, ...listing];
};

const publishSteps = (target: PublishTarget): UploadStep[] => [
  ...listingSteps(target),
  ...(target.pack ? [...fileSteps(PACK_LABELS), stepOf(STORE_STEP.ready, 'Ready to send for review')] : []),
];

export { publishSteps };
