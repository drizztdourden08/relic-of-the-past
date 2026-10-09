/* @layer shared-game @kind types */
import type { GridPos } from '@rotp/game-core';

interface SimChest {
  roomId: number;
  chestIndex: number;
  isBig: boolean;
  tile: GridPos;
  posKnown: boolean;
  opened: boolean;
  itemId?: number;
}

interface SimSprite {
  roomId: number;
  outdoor?: boolean;
  spriteType: number;
  tile: GridPos;
  posKnown: boolean;
  kind: 'npc' | 'standing' | 'overworld' | 'other';
  itemId?: number;
  carriesKey?: boolean;
  carriesBigKey?: boolean;
}

interface SimDoor {
  roomId: number;
  index: number;
  tiles: GridPos[];
  direction: 'n' | 's' | 'e' | 'w';
  kind: 'normal' | 'small-key' | 'big-key' | 'bombable' | 'shutter' | 'switch' | 'trap';
  opened: boolean;
  cellLock?: boolean;
  nativeType?: number;
  layer?: 0 | 1;
}

export type { SimChest, SimSprite, SimDoor };
