/* @layer store-site @kind logic */
import type { MediaRef } from '@rotp/hub-contracts';

const mediaUrl = (ref: MediaRef | null): string | null => ref?.url ?? null;

export { mediaUrl };
