/* @layer shared-game @kind types */
import type { CapacityFamilyId } from '@rotp/game-data';

type DungeonPiece = 'small-key' | 'big-key' | 'map' | 'compass';

type ReceiptItemClass =
  | { kind: 'progressive'; slot: string }
  | { kind: 'dungeon-item'; piece: DungeonPiece; base: string; dungeon: string }
  | { kind: 'capacity'; family: CapacityFamilyId; jump: number }
  | { kind: 'capacity-progressive'; family: CapacityFamilyId }
  | { kind: 'junk' }
  | { kind: 'standard' };

export type { DungeonPiece, ReceiptItemClass };
