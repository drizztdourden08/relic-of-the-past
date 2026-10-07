/* @layer store-site @kind logic */
/**
 * Sends a finished card or banner to the bucket: hashed, a presigned PUT asked for under the
 * hashed key, then the webp PUT straight to the bucket. Answers the reference the listing
 * names it by; store-api checks the object is there when the listing arrives.
 */
import type { MediaRole } from '@shared/store/keys';
import type { MediaRef } from '@shared/store/types';
import { beginMedia } from '../api/publish-endpoints';
import type { Picture } from '../lib/resize-image';
import { hashPack } from './hash-pack';

const WEBP = 'image/webp';

const uploadPicture = async (itemId: string, role: MediaRole, picture: Picture): Promise<MediaRef> => {
  const { blob, width, height } = picture;
  const sha256 = await hashPack(blob);
  const { key, url } = await beginMedia(itemId, { role, bytes: blob.size, sha256 });
  const response = await fetch(url, { method: 'PUT', body: blob, headers: { 'content-type': WEBP } });
  if (!response.ok) throw new Error(`The bucket refused the ${role} picture (${response.status}).`);
  return { key, width, height };
};

export { uploadPicture };
