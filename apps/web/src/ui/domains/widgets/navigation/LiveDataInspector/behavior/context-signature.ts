/* @layer renderer-widgets @kind logic */
/**
 * The content signature `use-detection-pass.ts`'s debounce gates on, pulled
 * out so `use-comparison.ts` can memoise its own (undebounced) diff
 * computation on the SAME key — one definition of "the context actually
 * changed", read by both the persisted-pass side effect and the display-only
 * diff derivation, so they recompute in lockstep without a second debounce.
 *
 * `context` is a fresh object every render (nothing upstream memoises the
 * whole tree), so this exists specifically to turn that into a string that
 * only changes when something a detector or a comparison could act on does.
 *
 * `liveGameId`'s four values are included on purpose: without them, walking
 * from an unmapped room into a DIFFERENT unmapped room (or crossing a
 * recorded palace mismatch, or re-entering through a different entrance)
 * changes nothing else in this list, so a pass would never rerun for
 * `presence.set.ts`'s own finding to move to the new room. `screenId` alone
 * cannot cover this: an unmapped room's `screenId` is null both before AND
 * after the move.
 *
 * `dataRevision()` is in here for the write side of the same problem: an
 * accepted finding changes the DATASET, not the game, so every other value
 * below reads identically before and after it. Without the counter a fix's
 * siblings stay on screen until the player walks into another room.
 */
import { dataRevision } from '@app/lib/game/data-revision';
import type { DetectionContext } from '@shared/game/recommendations';

const signatureOf = (context: DetectionContext): string => {
  const { observations } = context;
  const { liveGameId } = observations;
  return [
    dataRevision(), context.screenId, observations.realAvailable ? 1 : 0,
    observations.unmatchedCrossings.length, observations.existingConnections.length,
    observations.liveSprites?.length ?? -1, observations.grantedItems?.length ?? -1,
    observations.chests?.length ?? -1,
    liveGameId?.overworldIndex ?? -1, liveGameId?.roomIndex ?? -1,
    liveGameId?.palaceIndex ?? -1, liveGameId?.entranceId ?? -1,
  ].join('|');
};

export { signatureOf };
