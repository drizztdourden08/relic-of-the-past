/* @layer renderer-widgets @kind logic */
/** Indoor entrance/stair/walk-boundary collection — mutates allEntrances, returns respawn IDs. */
import {
  wasmGetEntranceSpawns, wasmGetEntranceRooms, wasmGetRoomExitDoors,
  wasmGetRoomStairInfo, wasmGetRoomWalkBoundaries,
} from '../../../../../lib/game';
import type { enrichEntrances } from '../widget-helpers';

type Entrance = ReturnType<typeof enrichEntrances>[number];

interface CollectArgs {
  primaryScreenIndex: number;
  allEntrances: Entrance[];
  exitScreenByRoom: Map<number, number>;
  fallHoleEntIds: Set<number>;
  overworldDoorEntIds: Set<number>;
}

const collectIndoorEntrances = (args: CollectArgs): Set<number> => {
  const { primaryScreenIndex, allEntrances, exitScreenByRoom, fallHoleEntIds, overworldDoorEntIds } = args;
  const currentRespawnIds = new Set<number>();

  const exitScreen = exitScreenByRoom.get(primaryScreenIndex);
  if (exitScreen != null) {
    const spawns = wasmGetEntranceSpawns();
    const rooms = wasmGetEntranceRooms();
    const exitDoors = wasmGetRoomExitDoors();
    if (spawns && rooms) {
      const roomOriginX = (primaryScreenIndex % 16) * 512;
      const roomOriginY = Math.floor(primaryScreenIndex / 16) * 512;
      // Use exit door trigger positions (from room door data) for overworld exits.
      // Match entrance IDs to exit doors by proximity to their spawn positions.
      const exitDoorPositions = exitDoors.map(d => ({ row: d.row, col: d.col, dir: d.direction, used: false }));
      for (let id = 0; id < rooms.length; id++) {
        if (rooms[id] !== primaryScreenIndex) continue;
        if (fallHoleEntIds.has(id)) continue; // fall-hole landings shown separately
        if (!overworldDoorEntIds.has(id)) currentRespawnIds.add(id); // track respawn IDs
        const spawn = spawns[id];
        if (!spawn) continue;
        const spawnCol = Math.floor((spawn.x - roomOriginX) / 8);
        const spawnRow = Math.floor((spawn.y - roomOriginY) / 8);
        // For overworld door entrances, try to use the actual exit door tile position
        let gridCol = spawnCol;
        let gridRow = spawnRow;
        if (overworldDoorEntIds.has(id) && exitDoorPositions.length > 0) {
          // Find nearest unused exit door to this spawn position
          let bestIdx = -1;
          let bestDist = Infinity;
          for (let ei = 0; ei < exitDoorPositions.length; ei++) {
            if (exitDoorPositions[ei].used) continue;
            const dr = exitDoorPositions[ei].row - spawnRow;
            const dc = exitDoorPositions[ei].col - spawnCol;
            const dist = dr * dr + dc * dc;
            if (dist < bestDist) { bestDist = dist; bestIdx = ei; }
          }
          if (bestIdx >= 0) {
            exitDoorPositions[bestIdx].used = true;
            const doorDir = exitDoorPositions[bestIdx].dir;
            // Offset to center on the passable door tiles
            if (doorDir === 'south') {
              gridCol = exitDoorPositions[bestIdx].col + 1;
              gridRow = exitDoorPositions[bestIdx].row + 3;
            } else if (doorDir === 'north') {
              gridCol = exitDoorPositions[bestIdx].col + 1;
              gridRow = exitDoorPositions[bestIdx].row + 4;
            } else if (doorDir === 'west') {
              gridCol = exitDoorPositions[bestIdx].col + 2;
              gridRow = exitDoorPositions[bestIdx].row + 1;
            } else {
              gridCol = exitDoorPositions[bestIdx].col + 2;
              gridRow = exitDoorPositions[bestIdx].row + 1;
            }
          }
        }
        if (gridRow < 0 || gridRow >= 64 || gridCol < 0 || gridCol >= 64) continue;
        // Replace overworld entry (wrong grid coords) with correct indoor spawn position
        const existingIdx = allEntrances.findIndex(e => e.id === id);
        if (existingIdx !== -1) {
          allEntrances[existingIdx] = { area: primaryScreenIndex, pos: 0, id, gridRow, gridCol, roomId: exitScreen };
          continue;
        }
        allEntrances.push({
          area: primaryScreenIndex,
          pos: 0,
          id,
          gridRow,
          gridCol,
          roomId: exitScreen,
        });
      }
    }
  }

  // Add inter-room stair connections from room header data.
  // These are room-to-room transitions via stair tiles (0x22/0x34).
  const stairs = wasmGetRoomStairInfo();
  for (let i = 0; i < stairs.length; i++) {
    const stair = stairs[i];
    if (stair.destRoom === 0) continue;
    const syntheticId = 1000 + i;
    allEntrances.push({
      area: primaryScreenIndex,
      pos: 0,
      id: syntheticId,
      gridRow: stair.row,
      gridCol: stair.col,
      roomId: stair.destRoom,
    });
  }

  // Add inter-room walk-through boundaries (palace toggle doors like Castle→Sewer).
  const walkBounds = wasmGetRoomWalkBoundaries();
  for (let i = 0; i < walkBounds.length; i++) {
    const wb = walkBounds[i];
    if (wb.destRoom === 0) continue;
    const syntheticId = 2000 + i;
    allEntrances.push({
      area: primaryScreenIndex,
      pos: 0,
      id: syntheticId,
      gridRow: wb.row,
      gridCol: wb.col,
      roomId: wb.destRoom,
    });
  }

  // When indoors, remove overworld entrances that don't belong to this room.
  // Overworld screen IDs overlap with indoor room IDs (e.g., OW screen 0x51 vs
  // indoor room 0x51), causing unrelated overworld entrances to leak through.
  const rooms = wasmGetEntranceRooms();
  if (rooms) {
    for (let i = allEntrances.length - 1; i >= 0; i--) {
      const e = allEntrances[i];
      if (e.id >= 200) continue; // fall holes (200+) and stairs (1000+) are fine
      if (rooms[e.id] === primaryScreenIndex) continue; // entrance belongs to this room
      // Remove: this is an overworld entrance that doesn't target this indoor room
      if (overworldDoorEntIds.has(e.id) && rooms[e.id] !== primaryScreenIndex) {
        allEntrances.splice(i, 1);
      }
    }
  }

  return currentRespawnIds;
};

export { collectIndoorEntrances };
