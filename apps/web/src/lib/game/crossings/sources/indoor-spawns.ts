/* @layer bridge-wasm @kind logic */
import type { ScreenCrossing } from '@shared/game/navigation';
import {
  wasmGetEntranceRooms, wasmGetEntranceSpawns, wasmGetExitScreenMap, wasmGetRoomExitDoors,
} from '../../';
import { enrichEntrances, FALL_HOLE_ID_BASE } from '../../flood/overworld-entrances';
import { roomOrigin } from '../../flood/world-origin';
import { readMapState } from '../../simulator/read-game-state';
import { doorCrossingTile, matchDoorsToSpawns, spawnCrossingTile } from '../place-tile';
import type { DoorRecord } from '../place-tile';
import { noTarget, overworldTarget, roomTarget } from '../resolve-target';
import { entranceRequirements } from '../availability';
import { makeCrossing } from '../make-crossing';
import type { CrossingPass, CrossingParts } from '../crossings.type';

interface SpawnRow {
  id: number;
  tile: { row: number; col: number };
  /** The floor the row puts the player on: 0 upper, 1 lower. */
  layer: 0 | 1;
  /** The overworld area the row's door sits on, when it is a door at all. */
  doorArea?: number;
  /** The area a fall hole drops from, when the row is a hole. */
  holeArea?: number;
}

/** Entrance-row areas, split by whether the row is a door or a pit. */
interface SpawnAreas {
  door: Map<number, number>;
  hole: Map<number, number>;
}

/**
 * The overworld sub-screen each entrance row's door or pit physically stands on.
 *
 * A 2x2 area records its entrances on the HEAD screen, so the raw tables name
 * the head for all four quarters. The enriched list resolves each row to the
 * quarter it really sits on, and is the same read the traversal graph makes, so
 * both name one screen for one door.
 */
const spawnAreas = (): SpawnAreas => {
  const areas: SpawnAreas = { door: new Map(), hole: new Map() };
  for (const entrance of enrichEntrances()) {
    const isHole = entrance.id >= FALL_HOLE_ID_BASE;
    const rows = isHole ? areas.hole : areas.door;
    const id = isHole ? entrance.id - FALL_HOLE_ID_BASE : entrance.id;
    if (!rows.has(id)) rows.set(id, entrance.area);
  }
  return areas;
};

/** Entrance rows whose destination is this room, placed on their spawn tile. */
const spawnRows = (roomIndex: number): SpawnRow[] => {
  const spawns = wasmGetEntranceSpawns();
  const rooms = wasmGetEntranceRooms();
  if (!spawns || !rooms) return [];
  const areas = spawnAreas();
  const origin = roomOrigin(roomIndex);
  const rows: SpawnRow[] = [];
  for (let id = 0; id < rooms.length; id++) {
    const spawn = rooms[id] === roomIndex ? spawns[id] : undefined;
    if (!spawn) continue;
    const tile = spawnCrossingTile(spawn, origin);
    if (!tile) continue;
    rows.push({
      id, tile,
      layer: spawn.startingLayer === 0 ? 0 : 1,
      ...(areas.door.has(id) ? { doorArea: areas.door.get(id) } : {}),
      ...(areas.hole.has(id) ? { holeArea: areas.hole.get(id) } : {}),
    });
  }
  return rows;
};

/** Exit-door records, readable only for the room the game currently holds. */
const exitDoorsOf = (roomIndex: number): DoorRecord[] => {
  const live = readMapState();
  if (live?.isIndoors !== true || live.roomIndex !== roomIndex) return [];
  return wasmGetRoomExitDoors().map((door) => ({ row: door.row, col: door.col, direction: door.direction }));
};

const partsFor = (pass: CrossingPass, row: SpawnRow, door: DoorRecord | undefined, exitScreen: number | undefined): CrossingParts => {
  const requirements = pass.scope.flood ? entranceRequirements(pass.scope.flood, row.id, pass.items) : [];
  if (row.holeArea !== undefined) {
    return {
      id: `hole:${row.id}`, class: 'entrance', kind: 'hole', origin: 'fall-hole', tile: row.tile,
      layer: row.layer, target: overworldTarget(row.holeArea), edgeSig: `e${row.id}`, requirements,
    };
  }
  if (row.doorArea === undefined) {
    return {
      id: `ent:${row.id}`, class: 'entrance', kind: 'entrance', origin: 'respawn', tile: row.tile,
      layer: row.layer, target: noTarget('respawn point'), edgeSig: `e${row.id}`, requirements,
    };
  }
  const tile = door ? doorCrossingTile(door, pass.reachable, row.tile) : row.tile;
  return {
    id: `ent:${row.id}`, class: 'entrance', kind: 'door', origin: 'room-door', tile,
    layer: row.layer,
    target: overworldTarget(exitScreen ?? row.doorArea),
    ...(door ? { side: door.direction } : {}),
    edgeSig: `e${row.id}`, requirements,
  };
};

/** Every entrance-table crossing of one room. Only the door rows compete for an
 *  exit-door record, so a respawn never takes the door's tile. */
const indoorSpawnCrossings = (pass: CrossingPass): ScreenCrossing[] => {
  const roomIndex = pass.scope.roomIndex;
  const rows = spawnRows(roomIndex);
  const exitScreen = wasmGetExitScreenMap().get(roomIndex);
  const doorRows = rows.filter((row) => row.doorArea !== undefined && row.holeArea === undefined);
  const claimed = matchDoorsToSpawns(doorRows.map((row) => ({ key: row.id, tile: row.tile })), exitDoorsOf(roomIndex));
  return rows.map((row) => makeCrossing(pass, partsFor(pass, row, claimed.get(row.id), exitScreen)));
};

export { indoorSpawnCrossings };
