/* @layer shared-game @kind types */
import type { ScreenRecord } from '../../../data';

interface VariantGameState {
  completedChecks?: ReadonlySet<string>;
  readFlag?: (address: number, bit: number) => boolean;
  entranceId?: number;
  progressTier?: number;
}

interface ScreenLookup {
  byOverworldScreen: Map<number, ScreenRecord>;
  byDungeonRoom: Map<string, ScreenRecord>;
  byCaveRoom: Map<number, ScreenRecord>;
  byEntranceId: Map<number, ScreenRecord[]>;
  byCaveRoomAll: Map<number, ScreenRecord[]>;
  byRoomAny: Map<number, ScreenRecord>;
}

type ScreenMatchMethod = 'exact' | 'entrance' | 'palace-scan' | 'cave-single' | 'cave-ambiguous' | 'variant' | 'overworld';

interface ScreenMatchResult {
  screen: ScreenRecord;
  method: ScreenMatchMethod;
  palaceMismatch?: { expected: number; actual: number };
  progressTier?: number;
}

export type { ScreenLookup, ScreenMatchMethod, ScreenMatchResult, VariantGameState };
