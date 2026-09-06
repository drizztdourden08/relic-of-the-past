/* @layer renderer-lib @kind hook */
/**
 * How many times the extracted sprite set has been rewritten this session. A
 * view that derives sprite URLs holds them in a memo; the URLs of a rewritten
 * set are new (item-sprites carries the revision in them), so the memo has to
 * be recomputed when this moves or it would keep serving the URLs that failed
 * while the folder was being written.
 */
import { useSpriteAvailabilityStore } from '../../stores/sprite-availability-store';

const useSpriteRevision = (): number => useSpriteAvailabilityStore((s) => s.revision);

export { useSpriteRevision };
