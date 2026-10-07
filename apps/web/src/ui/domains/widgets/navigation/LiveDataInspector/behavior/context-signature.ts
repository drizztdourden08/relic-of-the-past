/* @layer renderer-widgets @kind logic */
/**
 * The content signature `use-detection-pass.ts`'s debounce gates on, pulled
 * out so `use-comparison.ts` can memoise its own (undebounced) diff on the SAME
 * key. `context` is a fresh object every render, so this turns it into a string
 * that only changes when something a detector or a comparison could act on does.
 *
 * `liveGameId`'s four values are included on purpose: without them, walking
 * from an unmapped room into a DIFFERENT unmapped room (or crossing a recorded
 * palace mismatch, or re-entering through a different entrance) changes nothing
 * else here, so `presence.set.ts`'s finding would never move to the new room.
 * `screenId` alone cannot cover this: it is null both before AND after the move.
 *
 * NOT included: a dataset-edit revision counter. One would let a record edited
 * in the Data Inspector retrigger detection right away, but no such counter
 * exists in the dataset's write path (`registry.ts`'s `store` is replaced
 * wholesale with no version field). Adding one is write-path plumbing outside
 * this file's job, so it is left as a gap.
 */
import type { DetectionContext } from '@shared/game/recommendations';

const signatureOf = (context: DetectionContext): string => {
  const { observations } = context;
  const { liveGameId } = observations;
  return [
    context.screenId, observations.realAvailable ? 1 : 0,
    observations.unmatchedCrossings.length, observations.existingConnections.length,
    observations.liveSprites?.length ?? -1, observations.grantedItems?.length ?? -1,
    observations.chests?.length ?? -1,
    liveGameId?.overworldIndex ?? -1, liveGameId?.roomIndex ?? -1,
    liveGameId?.palaceIndex ?? -1, liveGameId?.entranceId ?? -1,
  ].join('|');
};

export { signatureOf };
