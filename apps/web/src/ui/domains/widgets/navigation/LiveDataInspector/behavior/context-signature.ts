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
 * NOT included: a dataset-edit revision counter. One would let a record the
 * user just edited in the Data Inspector retrigger detection right away
 * rather than waiting for the next room change, but no such counter exists
 * anywhere in the dataset's write path today — `registry.ts`'s `store` is
 * replaced wholesale on every write with no version field, and neither
 * `session-records.ts` nor `record-writers.ts` bump one. Inventing one here
 * would mean adding write-path plumbing well outside this file's job of
 * reading a context that already exists, so this is left as a gap rather
 * than guessed at.
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
