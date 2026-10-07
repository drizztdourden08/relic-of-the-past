/* @layer renderer-widgets @kind logic */
/**
 * Types for the connection audit, which covers the game's REAL in-game transitions
 * observed for the current screen. The hand-rolled add/remove pair that used
 * to live here was replaced by the connection `SetProbe`s
 * (`recommendations/strategies/connection/points.set.ts`, `indoor-edge.set.ts`);
 * a finding's shape is now `DraftRecommendation`, produced by `detectorFromStrategy`.
 */

/** How a real in-game destination index should be resolved to a screen id. */
type RealDestKind = 'screen' | 'room' | 'entrance';

/** A single real in-game transition observed for the current screen. */
interface RealTransition {
  /** Where this transition came from (exit map, stair table, flood, ...). */
  source: string;
  /** How to resolve `index` into a screen id. */
  kind: RealDestKind;
  /** Raw game index: overworld screen index, room index, or entrance id. */
  index: number;
}

export type { RealDestKind, RealTransition };
