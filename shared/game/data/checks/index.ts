/* @layer shared-game @kind data */
import { recordsIn } from '../registry';
import type { CheckRecord } from '../types';

// Every record file in the tree: the areas, the dungeons and the events.
const files = import.meta.glob('../records/checks/**/*.ts', { eager: true });

/**
 * Sorted by id, because the derived pass reads this list in order and a derived record only
 * ever names lower numbers: a combined event asks for the held items it sums, a dungeon's
 * "cleared" asks for its own earlier stages. The order used to come from the hand-written
 * barrels the tree no longer has, which made it a property of a file listing.
 */
const ALL_CHECKS: CheckRecord[] = recordsIn<CheckRecord>(files)
  .sort((a, b) => a.id.localeCompare(b.id));

export { ALL_CHECKS };
