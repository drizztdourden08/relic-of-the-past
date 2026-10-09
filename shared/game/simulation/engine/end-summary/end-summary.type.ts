/* @layer shared-game @kind types */
import type { DungeonId } from '../../../data';

interface EndSummary {
  screens: { discovered: number; entered: number; neverEntered: string[] };
  targets: { found: number; done: number; failed: number; stillPending: number };
  exits: { edges: number; leadingNowhereNew: number };
  checks: { verified: number };
  keys: { held: Partial<Record<DungeonId, number>>; bigKeys: DungeonId[] };
}

export type { EndSummary };
