/* @layer shared-game @kind logic */
/**
 * Shared shapes for the mechanical-invariant audit. Each rule module receives
 * the full dataset input and returns findings, and never throws.
 */
import type { CheckRecord, DungeonRecord, ItemRecord, ScreenRecord } from '../../game/data/types';

interface InvariantFinding {
  rule: string;
  checkId: string;
  field?: string;
  detail: string;
}

interface InvariantInput {
  checks: CheckRecord[];
  items: ItemRecord[];
  dungeons: DungeonRecord[];
  screens: ScreenRecord[];
  /** Text of the core sprite source file; the source-function rule only runs when provided. */
  spriteMainText?: string;
}

export type { InvariantFinding, InvariantInput };
