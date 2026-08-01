/* @layer renderer-widgets @kind logic */
/**
 * Types for the connection audit — cross-checks the static connection
 * dataset against the game's REAL in-game transitions for the current screen.
 */

import type { ConnectionTag, ScreenId } from '@shared/game/data';
import type { FileTarget } from '@shared/game/data/record-file-targets';
import type { WriteConnectionsArgs } from '@shared/ipc/screen-editor-contract';

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
type SuggestionKind = 'add' | 'remove';

/** One applyable finding about a connection edge. */
interface ConnectionSuggestion {
  kind: SuggestionKind;
  fromScreenId: ScreenId;
  toScreenId: ScreenId;
  tags: ConnectionTag[];
  /**
   * Read-only preview of the record that will be written or removed. The write
   * payload is `write`, not this text, so a finding cannot be hand-edited into a
   * different shape on its way to disk.
   */
  code: string;
  /** Human-readable justification shown in the widget. */
  reason: string;
  /** Connections source file, relative to shared/game/data/. */
  targetFile: FileTarget;
  /** Exactly what Apply sends. Null when the edge cannot be written safely. */
  write: WriteConnectionsArgs | null;
}

export type { RealDestKind, RealTransition, SuggestionKind, ConnectionSuggestion };
