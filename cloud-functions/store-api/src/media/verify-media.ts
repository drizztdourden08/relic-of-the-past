/* @layer store-api @kind logic */
import type { ListingPatchBody } from '@rotp/hub-contracts';
import type { MediaRole } from '@rotp/hub-contracts';
import { STORE_LIMITS } from '@rotp/hub-contracts';
import type { MediaRef } from '@rotp/hub-contracts';
import { badRequest } from '@rotp/hub-server';
import { storeBucket } from '../storage/store-bucket';

const verifyMedia = async (itemId: string, role: MediaRole, ref: MediaRef): Promise<void> => {
  const { width, height, bytes } = STORE_LIMITS[role];
  if (!ref.key.startsWith(`media/${itemId}/${role}-`)) throw badRequest(`The ${role} must be a picture uploaded for this item.`);
  if (ref.width !== width || ref.height !== height) throw badRequest(`The ${role} must be ${width}x${height}.`);
  const size = await storeBucket.headSize(ref.key);
  if (size === null) throw badRequest(`The ${role} upload did not arrive.`);
  if (size > bytes) {
    await storeBucket.remove(ref.key);
    throw badRequest(`The ${role} is ${size} bytes; the cap is ${bytes}.`);
  }
};

const verifyListingMedia = async (itemId: string, patch: ListingPatchBody): Promise<void> => {
  if (patch.card) await verifyMedia(itemId, 'card', patch.card);
  if (patch.banner) await verifyMedia(itemId, 'banner', patch.banner);
};

export { verifyListingMedia };
