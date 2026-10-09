/* @layer store-site @kind logic */
import type { MediaRef } from '@shared/store/types';

const mediaUrl = (ref: MediaRef | null): string | null => ref?.url ?? null;

export { mediaUrl };
