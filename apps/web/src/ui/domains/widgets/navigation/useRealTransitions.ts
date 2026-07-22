/* @layer renderer-widgets @kind hook */
/**
 * Assembles the union of every REAL in-game transition for the current screen,
 * used by the connection audit as ground truth. Indoors pulls the exit map,
 * stair/walk/travel tables and fall holes; outdoors uses the flood's border
 * crossings PLUS the overworld entrances (doors) and fall holes on the current
 * area — the flood alone omits interior doors and fall holes. Flood
 * connections are included so the audit refreshes on re-flood.
 */

import { useMemo } from 'react';
import {
  wasmGetExitScreenMap, wasmGetRoomStairInfo, wasmGetRoomWalkBoundaries,
  wasmGetRoomTravelDestinations, wasmGetFallHoles,
  wasmGetOverworldEntrances, wasmGetEntranceRooms, wasmGetAreaHeads,
} from '../../../../lib/game';
import type { ConnectionInfo } from '@shared/game/navigation';
import type { RealTransition } from './connection-audit-types';

// Overworld entrances (doors) on the current area, resolved entrance-id → room
// → screen id via the 'room' kind. Entrance `.area` stores the big-screen head,
// so compare group heads (mirrors enrichEntrances' area-head handling).
const collectOverworldEntrances = (overworldScreenIndex: number): RealTransition[] => {
  const heads = wasmGetAreaHeads();
  const entranceRooms = wasmGetEntranceRooms();
  const currentHead = heads ? heads[overworldScreenIndex] : overworldScreenIndex;
  const out: RealTransition[] = [];
  for (const e of wasmGetOverworldEntrances()) {
    const entranceHead = heads ? heads[e.area] : e.area;
    if (entranceHead !== currentHead) continue;
    const room = entranceRooms?.[e.id];
    if (room != null && room !== 0) out.push({ source: 'entrance', kind: 'room', index: room });
  }
  return out;
};

// Fall holes on the current area, resolved entrance-id → room, same head-group
// comparison as collectOverworldEntrances. These are ground truth the outdoor
// flood never sees, so 'transit:hole' edges from an overworld screen need them
// to avoid being wrongly flagged as unbacked.
const collectFallHoles = (overworldScreenIndex: number): RealTransition[] => {
  const heads = wasmGetAreaHeads();
  const entranceRooms = wasmGetEntranceRooms();
  const currentHead = heads ? heads[overworldScreenIndex] : overworldScreenIndex;
  const out: RealTransition[] = [];
  for (const h of wasmGetFallHoles()) {
    const holeHead = heads ? heads[h.area] : h.area;
    if (holeHead !== currentHead) continue;
    const room = entranceRooms?.[h.entranceId];
    if (room != null && room !== 0) out.push({ source: 'hole', kind: 'room', index: room });
  }
  return out;
};

const useRealTransitions = (
  isIndoors: boolean,
  roomIndex: number,
  floodConnections: ConnectionInfo[],
  overworldScreenIndex: number,
): RealTransition[] => {
  return useMemo<RealTransition[]>(() => {
    const out: RealTransition[] = [];
    if (isIndoors) {
      const exit = wasmGetExitScreenMap().get(roomIndex);
      if (exit != null) out.push({ source: 'exit', kind: 'screen', index: exit });
      for (const s of wasmGetRoomStairInfo()) {
        if (s.destRoom !== 0) out.push({ source: 'stair', kind: 'room', index: s.destRoom });
      }
      for (const w of wasmGetRoomWalkBoundaries()) {
        if (w.destRoom !== 0) out.push({ source: 'walk', kind: 'room', index: w.destRoom });
      }
      for (const t of wasmGetRoomTravelDestinations() ?? []) {
        if (t !== 0) out.push({ source: 'travel', kind: 'room', index: t });
      }
      for (const h of wasmGetFallHoles()) out.push({ source: 'hole', kind: 'entrance', index: h.entranceId });
      for (const c of floodConnections) out.push({ source: 'flood', kind: 'room', index: c.targetScreen });
    } else {
      for (const c of floodConnections) out.push({ source: 'flood', kind: 'screen', index: c.targetScreen });
      out.push(...collectOverworldEntrances(overworldScreenIndex));
      out.push(...collectFallHoles(overworldScreenIndex));
    }
    return out;
  }, [isIndoors, roomIndex, floodConnections, overworldScreenIndex]);
};

export { useRealTransitions };
