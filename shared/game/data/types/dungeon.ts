/* @layer shared-game @kind types */
import type { CheckId, DungeonId, ItemId, ScreenId } from './ids';

interface DungeonGameId {
  palaceIndex?: number;
  bossRoomId?: number;
}

/**
 * Closes a real gap the audit found: boss/prize/medallion facts for the same
 * dungeons were duplicated across checks/dungeons.ts and a second independent
 * room-flag table in checks/flags/room.ts, with medallion requirements living
 * in a third place. One record now.
 */
interface DungeonRecord {
  id: DungeonId;
  gameId: DungeonGameId;
  vanillaName?: string;
  randomizerName: string;
  /**
   * The file stem this dungeon's records live under, in both
   * `screens/<world>-world/dungeons/` and `connections/<world>-world/dungeons/`.
   * Carried on the record so a destination path is selected from a `DungeonId`
   * and never derived from a display name — a rename must not move a file.
   */
  fileStem: string;
  /** The first castle has no boss of its own. */
  bossCheckId?: CheckId;
  /** The two tower dungeons: no prize. */
  prizeCheckId?: CheckId;
  /** e.g. Ether for Misery Mire. */
  medallionGate?: ItemId;
  roomScreenIds: readonly ScreenId[];
}

export type { DungeonGameId, DungeonRecord };
