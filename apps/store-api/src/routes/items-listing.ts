/* @layer store-api @kind logic */
import { randomUUID } from 'node:crypto';
import { STORE_ROUTES } from '@rotp/hub-contracts';
import type { ItemChangeResponse } from '@rotp/hub-contracts';
import { listingPatchSchema } from '@rotp/hub-contracts';
import type { ListingPatchBody } from '@rotp/hub-contracts';
import type { ListingEdit, StoreItem } from '@rotp/hub-contracts';
import { parseBody } from '@rotp/hub-server';
import { now } from '@rotp/hub-server';
import type { Route } from '@rotp/hub-server';
import { requirePlayer } from '../auth/player';
import { itemsRepo } from '../db/items-repo';
import type { ItemPatch } from '../db/items-repo.type';
import { loadOwnItem } from '../items/item-guards';
import { slugOf } from '../items/new-item';
import { verifyListingMedia } from '../media/verify-media';
import { signItem } from '../media/sign-media';
import { EDIT_ID_CHARS } from './items-listing.constants';

const directChange = (patch: ListingPatchBody, at: number): ItemPatch =>
  ({ ...patch, ...(patch.name ? { slug: slugOf(patch.name) } : {}), updatedAt: at });

const queuedChange = (item: StoreItem, patch: ListingPatchBody, at: number): ItemPatch => {
  const superseded = item.listingEdits.map((edit): ListingEdit => (edit.review.state === 'waiting'
    ? { ...edit, review: { ...edit.review, state: 'withdrawn', decidedAt: at } }
    : edit));
  const edit: ListingEdit = {
    id: `edit-${randomUUID().replace(/-/g, '').slice(0, EDIT_ID_CHARS)}`,
    patch,
    review: { state: 'waiting', submittedAt: at, decidedAt: null, by: null, note: '' },
  };
  return { listingEdits: [...superseded, edit] };
};

const itemsListing: Route = {
  ...STORE_ROUTES.itemsListing,
  handler: async ({ req, res, params }) => {
    const player = await requirePlayer(req);
    const item = await loadOwnItem(params.id, player);
    const patch = parseBody(listingPatchSchema, req.body);
    await verifyListingMedia(item.id, patch);
    const at = now();
    const updated = await itemsRepo.mutate(item.id, (latest) =>
      (latest.publishedAt === null ? directChange(patch, at) : queuedChange(latest, patch, at)));
    const body: ItemChangeResponse ={ item: await signItem(updated) };
    res.status(200).json(body);
  },
};

export { itemsListing };
