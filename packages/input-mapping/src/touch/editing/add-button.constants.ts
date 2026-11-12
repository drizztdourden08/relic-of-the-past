/* @layer shared-input @kind constants */
import type { TouchEmit } from '@rotp/features';

const ROUND_EMITS: ReadonlySet<TouchEmit> = new Set<TouchEmit>(['a', 'b', 'x', 'y']);

export { ROUND_EMITS };
