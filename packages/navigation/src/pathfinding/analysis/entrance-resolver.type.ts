/* @layer shared-game @kind types */
import type { ConnectionPointData } from '@rotp/game-data';
import type { OverworldEntrance } from '@rotp/game-core';

interface EntranceResolverInput {
  entrances: OverworldEntrance[];
  exitScreenByRoom: Map<number, number>;
  entranceRooms: Uint16Array;
}

interface ResolvedEntrance {
  screenIndex: number;
  entranceId: number;
  point: ConnectionPointData;
}

export type { EntranceResolverInput, ResolvedEntrance };
