/* @layer renderer-lib @kind logic */
import type { MediaRef } from '@shared/store/types';

const storeMediaUrl = (ref: MediaRef | null): string | null => ref?.url ?? null;

export { storeMediaUrl };
