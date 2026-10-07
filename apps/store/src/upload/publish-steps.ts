/* @layer store-site @kind logic */
/**
 * The steps a publish shows in its dialog and the words of its tray row. A new item
 * creates its listing first and then sends its pictures; an edit sends its pictures, then
 * the listing that names them. A pack adds its check, its upload, the store's check and
 * the wait for "Send for review".
 */
import { fileSteps, stepOf } from '@site-kit/upload/upload-steps';
import type { UploadStep } from '@site-kit/upload/upload-job.type';
import type { PublishTarget } from './publish-target.type';

const STORE_STEP = { listing: 'listing', pictures: 'pictures', ready: 'ready' } as const;

const PACK_LABELS = { hash: 'Pack checked', upload: 'Uploading the pack', verify: 'Checked by the store' };

const hasPictures = (target: PublishTarget) => target.card !== null || target.banner !== null;

const hasListingPatch = (target: PublishTarget) => Object.keys(target.patch).length > 0;

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

const publishLabel = (target: PublishTarget, n: number | null): string => {
  if (n !== null) return `${target.itemName}, v${n}`;
  return target.pack ? `${target.itemName}, new version` : `${target.itemName}, listing`;
};

const publishTitle = (target: PublishTarget): string =>
  (target.isNew || target.pack ? `Publishing ${target.itemName}` : `Updating ${target.itemName}`);

export { STORE_STEP, publishSteps, publishLabel, publishTitle, hasPictures, hasListingPatch };
