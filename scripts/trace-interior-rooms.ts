/**
 * Full interior room connectivity tracer - reads ALL data from ROM.
 *
 * Builds a complete room graph using:
 * 1. Door data from room objects (direction + type → adjacent room connections)
 * 2. Staircase destinations from room headers (bytes 9-13)
 * 3. Exit table (79 entries): room → OW screen mapping
 * 4. Entrance table: OW screen → room mapping
 *
 * Then flood-fills from each OW entrance to find which OW screens are
 * connected via interior passages.
 *
 * Door word format: high_byte = door_type, bits 4-7 = position, bits 0-1 = direction
 * Direction: 0=North, 1=South, 2=West, 3=East
 * kDoorType_ExitToOw = 0x12
 */
import { loadRom } from '../shared/asset-extraction/rom/rom-loader';

const rom = loadRom('./test-roms/Legend of Zelda, The - A Link to the Past (USA).sfc');

// ─── ROM Tables ───────────────────────────────────────────────────────────────
const ADDR_OW_ENTRANCE_AREA = 0x9BB96F;
const ADDR_OW_ENTRANCE_ID = 0x9BBB73;
const ADDR_ENTRANCE_ROOMS = 0x82C813;
const ADDR_EXIT_ROOMS = 0x82DD8A;       // word per exit (79 entries)
const ADDR_EXIT_SCREEN_INDEX = 0x82DE28; // BYTE per exit (79 entries)
const NUM_EXITS = 79;

const DOOR_TYPE_EXIT_TO_OW = 0x12;

// Door types that are entrance/exit to OW (NOT inter-room connections)
const OW_DOOR_TYPES = new Set([
  0x06, // EntranceDoor
  0x08, // WaterfallTunnel
  0x0A, // EntranceLarge
  0x0C, // EntranceLarge2
  0x0E, // EntranceCave
  0x10, // EntranceCave2
  0x12, // ExitToOw
  0x14, // ThroneRoom
  0x16, // PlayerBgChange
]);

// Staircase door types (vertical transitions, not adjacent room connections)
const STAIR_DOOR_TYPES = new Set([
  0x20, 0x22, 0x24, 0x26, // StairMaskLocked 0-3
  0x2E, // some stair variant
  0x36, 0x38, // more stair types
]);

// ─── Load Exit Table ──────────────────────────────────────────────────────────
interface RoomExit {
  exitIdx: number;
  roomId: number;
  owScreen: number;
}

const allExits: RoomExit[] = [];
const exitsByRoom = new Map<number, RoomExit[]>();

for (let i = 0; i < NUM_EXITS; i++) {
  const roomId = rom.getWord(ADDR_EXIT_ROOMS + i * 2);
  const owScreen = rom.getByte(ADDR_EXIT_SCREEN_INDEX + i); // BYTE, not word!
  const exit: RoomExit = { exitIdx: i, roomId, owScreen };
  allExits.push(exit);
  if (!exitsByRoom.has(roomId)) exitsByRoom.set(roomId, []);
  exitsByRoom.get(roomId)!.push(exit);
}

// ─── Load OW Entrances ────────────────────────────────────────────────────────
interface OWEntrance {
  owIdx: number;
  owScreen: number;
  entId: number;
  roomId: number;
}

const entrances: OWEntrance[] = [];
for (let i = 0; i < 129; i++) {
  const area = rom.getWord(ADDR_OW_ENTRANCE_AREA + i * 2);
  if (area >= 0x40) continue; // LW only
  const entId = rom.getByte(ADDR_OW_ENTRANCE_ID + i);
  const roomId = rom.getWord(ADDR_ENTRANCE_ROOMS + entId * 2);
  entrances.push({ owIdx: i, owScreen: area, entId, roomId });
}

// ─── Room Header: Staircase Destinations ──────────────────────────────────────
// Per dungeon.c line 4339: destination = dung_hdr_travel_destinations[j + 1]
// where j is the staircase index (0-3). So destinations are at hdr bytes 10-13.
// Byte 9 (dung_hdr_travel_destinations[0]) is for movable blocks, not stairs.
function getStaircaseDestinations(roomId: number, maxCount?: number): number[] {
  let p = 0x40000 | rom.getWord(0x4f502 + roomId * 2);
  if (p === 0x4ffef) p = 0x82edc5;
  const dests: number[] = [];
  const limit = maxCount ?? 4;
  for (let i = 0; i < limit; i++) {
    const d = rom.getByte(p + 10 + i); // byte 10 = travel_destinations[1]
    if (d !== 0 && d !== 0xff && d !== roomId) dests.push(d);
  }
  return [...new Set(dests)];
}

// ─── Parse Room Doors ─────────────────────────────────────────────────────────
interface RoomDoor {
  type: number;
  direction: number; // 0=N, 1=S, 2=W, 3=E
  position: number;
}

function getRoomDoors(roomId: number): RoomDoor[] {
  const ptrAddr = 0x1f8000 + roomId * 3;
  const roomAddr = rom.getByte(ptrAddr) | (rom.getByte(ptrAddr + 1) << 8) | (rom.getByte(ptrAddr + 2) << 16);
  if (roomAddr === 0 || roomAddr === 0xffffff) return [];

  let objP = roomAddr + 2; // skip floor + layout bytes
  const doors: RoomDoor[] = [];

  // Scan 3 layers
  for (let layer = 0; layer < 3; layer++) {
    while (true) {
      const w = rom.getByte(objP) | (rom.getByte(objP + 1) << 8);
      if (w === 0xffff) { objP += 2; break; }
      if (w === 0xfff0) {
        objP += 2;
        // Door entries follow
        while (true) {
          const dw = rom.getByte(objP) | (rom.getByte(objP + 1) << 8);
          if (dw === 0xffff) { objP += 2; break; }
          doors.push({
            type: dw >> 8,
            direction: dw & 3,
            position: (dw >> 4) & 0xf,
          });
          objP += 2;
        }
        break;
      }
      objP += 3;
    }
  }
  return doors;
}

// ─── Build Room Connectivity Graph ────────────────────────────────────────────
// Key insight: Through-passage caves use DOOR ADJACENCY (walking between rooms).
// Room grid: rooms differ by ±1 (E/W) or ±0x10 (N/S).
// A door with direction 0=N, 1=S, 2=W, 3=E connects to the adjacent room.
//
// Staircase destinations are for holes/floor transitions within dungeons,
// NOT for through-passage traversal.
//
// Only rooms < 0x100 can form passages (0x100+ always exit to entrance).

const roomNeighbors = new Map<number, Set<number>>();
const roomHasOwExit = new Map<number, boolean>();
const roomDoorsByDir = new Map<number, Set<number>>(); // room → set of directions with doors

function addEdge(from: number, to: number) {
  if (!roomNeighbors.has(from)) roomNeighbors.set(from, new Set());
  roomNeighbors.get(from)!.add(to);
}

const DIR_OFFSETS = [-0x10, 0x10, -1, 1]; // N, S, W, E

for (let roomId = 0; roomId < 0x100; roomId++) {
  const doors = getRoomDoors(roomId);
  const dirSet = new Set<number>();

  for (const door of doors) {
    if (OW_DOOR_TYPES.has(door.type)) {
      roomHasOwExit.set(roomId, true);
    } else if (!STAIR_DOOR_TYPES.has(door.type)) {
      dirSet.add(door.direction);
    }
  }
  roomDoorsByDir.set(roomId, dirSet);
}

// Build edges: room A connects to room B if A has a door toward B
// AND B has a door toward A (bidirectional check)
const OPPOSITE_DIR = [1, 0, 3, 2]; // N↔S, W↔E

for (let roomId = 0; roomId < 0x100; roomId++) {
  const dirs = roomDoorsByDir.get(roomId)!;
  for (const dir of dirs) {
    const neighbor = roomId + DIR_OFFSETS[dir];
    if (neighbor >= 0 && neighbor < 0x100) {
      const neighborDirs = roomDoorsByDir.get(neighbor);
      if (neighborDirs && neighborDirs.has(OPPOSITE_DIR[dir])) {
        addEdge(roomId, neighbor);
      }
    }
  }

  // Staircase connections: use header travel_destinations to find room links.
  // Per dungeon.c line 4339: destination = dung_hdr_travel_destinations[j + 1]
  // Bytes 10-13 of header are staircase destinations. Validate with reciprocal check.
  let p2 = 0x40000 | rom.getWord(0x4f502 + roomId * 2);
  if (p2 === 0x4ffef) p2 = 0x82edc5;
  for (let i = 0; i < 4; i++) {
    const dest = rom.getByte(p2 + 10 + i);
    if (dest === 0 || dest === 0xff || dest === roomId || dest >= 0x100) continue;
    // Reciprocal check: does dest's header also point back to roomId?
    let dp = 0x40000 | rom.getWord(0x4f502 + dest * 2);
    if (dp === 0x4ffef) dp = 0x82edc5;
    let reciprocal = false;
    for (let j = 0; j < 4; j++) {
      if (rom.getByte(dp + 10 + j) === roomId) { reciprocal = true; break; }
    }
    if (reciprocal) {
      addEdge(roomId, dest);
      addEdge(dest, roomId);
    }
  }
}

// Also check rooms 0x100+ for OW exit doors (informational)
for (let roomId = 0x100; roomId < 0x140; roomId++) {
  const doors = getRoomDoors(roomId);
  for (const door of doors) {
    if (door.type === DOOR_TYPE_EXIT_TO_OW) {
      roomHasOwExit.set(roomId, true);
    }
  }
}

// ─── Flood Fill from Each Entrance ────────────────────────────────────────────
// For each entrance: BFS through room graph, find reachable exit-table rooms

interface InteriorConnection {
  entranceScreen: number;
  entranceRoom: number;
  exitScreen: number;
  exitRoom: number;
  path: number[]; // rooms traversed
}

const connections: InteriorConnection[] = [];

for (const ent of entrances) {
  // Only trace rooms < 0x100 — these are the passage/dungeon rooms
  if (ent.roomId >= 0x100) continue;

  const visited = new Map<number, number[]>();
  const queue: { roomId: number; path: number[] }[] = [
    { roomId: ent.roomId, path: [ent.roomId] },
  ];

  while (queue.length > 0) {
    const { roomId, path } = queue.shift()!;
    if (visited.has(roomId)) continue;
    visited.set(roomId, path);

    // Cap search depth: caves are 1-3 rooms via staircases
    if (path.length > 4) continue;

    // Check exit table
    const roomExits = exitsByRoom.get(roomId) || [];
    for (const exit of roomExits) {
      if (exit.owScreen !== ent.owScreen) {
        connections.push({
          entranceScreen: ent.owScreen,
          entranceRoom: ent.roomId,
          exitScreen: exit.owScreen,
          exitRoom: roomId,
          path,
        });
      }
    }

    // Expand to neighbors
    const neighbors = roomNeighbors.get(roomId);
    if (neighbors) {
      for (const n of neighbors) {
        if (!visited.has(n)) {
          queue.push({ roomId: n, path: [...path, n] });
        }
      }
    }
  }
}

// ─── Output ───────────────────────────────────────────────────────────────────

// Show ALL entrances grouped by screen, with their room's exit table status
console.log("=== All LW Entrances with Exit Table Cross-Reference ===");
const entByScreen = new Map<number, OWEntrance[]>();
for (const ent of entrances) {
  if (!entByScreen.has(ent.owScreen)) entByScreen.set(ent.owScreen, []);
  entByScreen.get(ent.owScreen)!.push(ent);
}

for (const [screen, ents] of [...entByScreen.entries()].sort((a, b) => a[0] - b[0])) {
  console.log(`\n  Screen 0x${screen.toString(16)}:`);
  for (const e of ents) {
    const exits = exitsByRoom.get(e.roomId) || [];
    const exitStr = exits.length ? ` EXIT→[${exits.map(x => '0x' + x.owScreen.toString(16)).join(',')}]` : '';
    const hasOwDoor = roomHasOwExit.get(e.roomId) ? ' [OW-door]' : '';
    const dests = getStaircaseDestinations(e.roomId);
    const destStr = dests.length ? ` stairs→[${dests.map(d => '0x' + d.toString(16)).join(',')}]` : '';
    console.log(`    ent[${e.owIdx}] id=${e.entId} room=0x${e.roomId.toString(16)}${exitStr}${hasOwDoor}${destStr}`);
  }
}

// Also show full exit table for reference
console.log("\n=== Exit Table (LW only) ===");
for (const e of allExits.filter(x => x.owScreen < 0x40)) {
  console.log(`  exit[${e.exitIdx}]: room 0x${e.roomId.toString(16)} → screen 0x${e.owScreen.toString(16)}`);
}

// BFS passage results
console.log(`\n=== BFS Passages (door adjacency + reciprocal staircases, depth 4) ===`);
console.log(`Found ${connections.length} connections`);

// Unique screen-to-screen connections (LW only)
const screenPairs = new Set<string>();
for (const c of connections) {
  if (c.entranceScreen < 0x40 && c.exitScreen < 0x40) {
    const a = Math.min(c.entranceScreen, c.exitScreen);
    const b = Math.max(c.entranceScreen, c.exitScreen);
    screenPairs.add(`0x${a.toString(16)} ↔ 0x${b.toString(16)}`);
  }
}
console.log(`Unique screen pairs: ${screenPairs.size}`);
for (const pair of [...screenPairs].sort()) {
  console.log(`  ${pair}`);
}

// Show specific passages with paths
console.log("\n=== Passage Details ===");
const seen = new Set<string>();
for (const c of connections) {
  if (c.entranceScreen >= 0x40 || c.exitScreen >= 0x40) continue;
  const key = `${c.entranceScreen}→${c.exitScreen}`;
  if (seen.has(key)) continue;
  seen.add(key);
  const pathStr = c.path.map(r => '0x' + r.toString(16)).join('→');
  console.log(`  screen 0x${c.entranceScreen.toString(16)} → screen 0x${c.exitScreen.toString(16)} [${pathStr}]`);
}
