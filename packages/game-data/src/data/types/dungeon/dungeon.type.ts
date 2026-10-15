/* @layer shared-game @kind types */
import type { ActorId, CheckId, DungeonId, ItemId, RegionId, ScreenId } from '../ids';
import type { ReviewMark } from '../review';

interface DungeonGameId {
  palaceIndex?: number;
  bossRoomId?: number;
}

interface DungeonItems {
  bigKey: ItemId | null;
  smallKey: ItemId | null;
  smallKeyCount: number;
  map: ItemId | null;
  compass: ItemId | null;
}

interface DungeonRecord {
  id: DungeonId;
  gameId: DungeonGameId;
  name: string;
  fileStem: string;
  items: DungeonItems;
  bossCheckId?: CheckId;
  prizeCheckId?: CheckId;
  bossActorId?: ActorId;
  medallionGate?: ItemId;
  roomScreenIds: readonly ScreenId[];
  regionIds: readonly RegionId[];
  review?: ReviewMark;
}

export type { DungeonGameId, DungeonRecord };
