/* @layer renderer-lib @kind hook */
import { useSpriteAvailabilityStore } from '../../stores/sprite-availability-store';

const useSpriteRevision = (): number => useSpriteAvailabilityStore((s) => s.revision);

export { useSpriteRevision };
