/* @layer renderer-lib @kind logic */
import type { MediaRef } from '@rotp/hub-contracts';

const storeMediaUrl = (ref: MediaRef | null): string | null => ref?.url ?? null;

export { storeMediaUrl };
