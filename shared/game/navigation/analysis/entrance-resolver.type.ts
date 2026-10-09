/* @layer shared-game @kind types */
import type { ConnectionPointData } from '../nav-data.types';
import type { OverworldEntrance } from '../types';

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
