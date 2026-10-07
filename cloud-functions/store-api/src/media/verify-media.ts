/* @layer store-api @kind logic */
/** A listing that names a picture is checked against the bucket before it is kept: the key
 *  belongs to this item and role, the size is the role's, and the object arrived within the
 *  role's byte cap. An oversized object is removed. */
import type { ListingPatchBody } from '../../../../shared/store/schemas';
import type { MediaRole } from '../../../../shared/store/keys';
import { STORE_LIMITS } from '../../../../shared/store/limits';
import type { MediaRef } from '../../../../shared/store/types';
import { badRequest } from '../../../hub-core/http/http-error';
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

export { verifyMedia, verifyListingMedia };
