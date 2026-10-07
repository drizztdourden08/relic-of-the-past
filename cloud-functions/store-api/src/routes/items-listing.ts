/* @layer store-api @kind logic */
/** POST /items/:id/listing { name?, summary?, description?, tags?, license?, card?, banner? }.
 *  An item never published changes at once, and its slug follows a new name. A published
 *  one queues the change for review; a newer edit replaces a waiting one, which is marked
 *  withdrawn. Named pictures are checked against the bucket first. */
import { randomUUID } from 'node:crypto';
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import type { ItemChangeResponse } from '../../../../shared/store/api-types';
import { listingPatchSchema } from '../../../../shared/store/schemas';
import type { ListingPatchBody } from '../../../../shared/store/schemas';
import type { ListingEdit, StoreItem } from '../../../../shared/store/types';
import { parseBody } from '../../../hub-core/http/parse-body';
import { now } from '../../../hub-core/db/firestore';
import type { Route } from '../../../hub-core/route.type';
import { requirePlayer } from '../auth/player';
import { itemsRepo } from '../db/items-repo';
import type { ItemPatch } from '../db/items-repo';
import { loadOwnItem } from '../items/item-guards';
import { slugOf } from '../items/new-item';
import { verifyListingMedia } from '../media/verify-media';
import { signItem } from '../media/sign-media';

const EDIT_ID_CHARS = 12;

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
