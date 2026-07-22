/* @layer renderer-widgets @kind logic */
/**
 * Types for the connection audit — cross-checks the static ALL_CONNECTIONS
 * dataset against the game's REAL in-game transitions for the current screen.
 */

import type { ConnectionTag } from '@shared/game/data/connections/tags';

/** How a real in-game destination index should be resolved to a screen id. */
type RealDestKind = 'screen' | 'room' | 'entrance';

/** A single real in-game transition observed for the current screen. */
interface RealTransition {
  /** Where this transition came from (exit map, stair table, flood, …). */
  source: string;
  /** How to resolve `index` into a screen id. */
  kind: RealDestKind;
  /** Raw game index: overworld screen index, room index, or entrance id. */
  index: number;
}

/** Kind of dataset edit a finding proposes. */
type SuggestionKind = 'add' | 'remove' | 'fix';

/** An editable, applyable finding about one connection edge. */
interface ConnectionSuggestion {
  kind: SuggestionKind;
  from: string;
  to: string;
  tags: ConnectionTag[];
  /** Exact object-literal line to write (add/fix) or the offending line (remove). */
  code: string;
  /** Human-readable justification shown in the widget. */
  reason: string;
  /** Connections source file, relative to shared/game/data/. */
  targetFile: string;
}

export type { RealDestKind, RealTransition, SuggestionKind, ConnectionSuggestion };
