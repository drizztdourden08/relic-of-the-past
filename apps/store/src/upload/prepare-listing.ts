/* @layer store-site @kind logic */
import { createItem } from '../api/publish-endpoints/create-item';
import { submitListing } from '../api/publish-endpoints/submit-listing';
import { STORE_STEP } from './publish-steps/publish-steps.constants';
import { hasListingPatch } from './publish-steps/has-listing-patch';
import { hasPictures } from './publish-steps/has-pictures';
import { uploadPicture } from './upload-picture';
import type { PublishTarget } from './publish-target.type';
import type { StoreContext } from './prepare-listing.type';

const createDraft = async (context: StoreContext, target: PublishTarget): Promise<PublishTarget> => {
  const { save, step, emit } = context;
  if (!target.draft) return target;
  step(STORE_STEP.listing, 'running');
  const { item } = await createItem(target.draft);
  emit(item);
  const next = { ...target, itemId: item.id, itemName: item.name, draft: null };
  await save(next);
  step(STORE_STEP.listing, 'done', 'draft');
  return next;
};

const sendPictures = async (context: StoreContext, target: PublishTarget, itemId: string): Promise<PublishTarget> => {
  const { save, step } = context;
  const { card, banner } = target;
  if (!hasPictures(target)) return target;
  step(STORE_STEP.pictures, 'running');
  const patch = { ...target.patch };
  if (card) patch.card = await uploadPicture(itemId, 'card', card);
  if (banner) patch.banner = await uploadPicture(itemId, 'banner', banner);
  const next = { ...target, patch, card: null, banner: null };
  await save(next);
  step(STORE_STEP.pictures, 'done', [card && 'card', banner && 'banner'].filter(Boolean).join(', '));
  return next;
};

const sendListing = async (context: StoreContext, target: PublishTarget, itemId: string): Promise<PublishTarget> => {
  const { save, step, emit } = context;
  if (!hasListingPatch(target)) return target;
  const stepId = target.isNew ? STORE_STEP.pictures : STORE_STEP.listing;
  step(stepId, 'running');
  const { item } = await submitListing(itemId, target.patch);
  emit(item);
  const next = { ...target, itemName: item.name, patch: {} };
  await save(next);
  step(stepId, 'done');
  return next;
};

const prepareListing = async (context: StoreContext): Promise<PublishTarget> => {
  const { signal } = context;
  const drafted = await createDraft(context, context.target);
  const { itemId } = drafted;
  if (!itemId) throw new Error('The listing was not created.');
  signal.throwIfAborted();
  const pictured = await sendPictures(context, drafted, itemId);
  signal.throwIfAborted();
  return sendListing(context, pictured, itemId);
};

export { prepareListing };
