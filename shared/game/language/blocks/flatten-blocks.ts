/* @layer shared-game @kind logic */
/**
 * Blocks back to lines. The exact inverse of `splitBlocks`.
 *
 * Every line comes back out in its original order and as the same value it went
 * in as, so `joinLines(flattenBlocks(splitBlocks(lines)))` is `joinLines(lines)`
 * and an entry that was only grouped, never edited, still serialises byte for
 * byte. Nothing about a block survives the trip: `ends` restates the wait its
 * last line already carries, and `inherited` is a derived view of the screen, so
 * neither has anything to put back.
 */
import type { DialogueLineView } from '../lines/types';
import type { BlockDoc } from './types';

const flattenBlocks = (doc: BlockDoc): DialogueLineView[] => doc.blocks.flatMap(
  block => block.lines,
);

export { flattenBlocks };
