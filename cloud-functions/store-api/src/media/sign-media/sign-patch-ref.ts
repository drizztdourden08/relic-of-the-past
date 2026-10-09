/* @layer store-api @kind logic */
import type { MediaRef } from '../../../../../shared/store/types';
import { signRef } from './sign-ref';

const signPatchRef = (ref: MediaRef | null | undefined): Promise<MediaRef | null | undefined> =>
  (ref === undefined ? Promise.resolve(undefined) : signRef(ref));

export { signPatchRef };
