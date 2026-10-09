/* @layer shared-game @kind types */
import type { DungeonId } from '../../../data';

interface RoomMaps {
  groupByRoom: Map<number, number>;
  dungeonByRoom: Map<number, DungeonId>;
}

export type { RoomMaps };
