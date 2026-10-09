/* @layer store-site @kind logic */
import type { MediaRole } from '@shared/store/keys';
import type { MediaRef } from '@shared/store/types';
import { beginMedia } from '../api/publish-endpoints/begin-media';
import type { Picture } from '../lib/resize-image.type';
import { hashPack } from './hash-pack';
import { WEBP } from './upload-picture.constants';

const uploadPicture = async (itemId: string, role: MediaRole, picture: Picture): Promise<MediaRef> => {
  const { blob, width, height } = picture;
  const sha256 = await hashPack(blob);
  const { key, url } = await beginMedia(itemId, { role, bytes: blob.size, sha256 });
  const response = await fetch(url, { method: 'PUT', body: blob, headers: { 'content-type': WEBP } });
  if (!response.ok) throw new Error(`The bucket refused the ${role} picture (${response.status}).`);
  return { key, width, height };
};

export { uploadPicture };
