/* @layer shared-game @kind types */
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
  spriteMainText?: string;
}

export type { InvariantFinding, InvariantInput };
