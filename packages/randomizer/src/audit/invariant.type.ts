/* @layer shared-game @kind types */
import type { CheckGameId, CheckRecord, DungeonRecord, ItemRecord, ScreenRecord } from '@rotp/game-data';

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

type KindRule = (check: CheckRecord, g: CheckGameId) => string[];

export type { InvariantFinding, InvariantInput, KindRule };
