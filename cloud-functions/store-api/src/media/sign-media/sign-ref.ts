/* @layer store-api @kind logic */
import type { MediaRef } from '../../../../../shared/store/types';
import { storeBucket } from '../../storage/store-bucket';
import { WEBP } from './sign-media.constants';

const signRef = async (ref: MediaRef | null): Promise<MediaRef | null> =>
  (ref ? { ...ref, url: await storeBucket.signPreview(ref.key, WEBP) } : null);

export { signRef };
