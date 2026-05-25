/**
 * Generate an interactive HTML visualization of the LW flood fill.
 * - Overworld grid with connections and entrance counts
 * - Per-screen interior GRID maps with directional connections and entrance indicators
 */
import { loadRom } from '../shared/asset-extraction/rom/rom-loader';
import { floodFillScreen, initEngine } from '../shared/game/navigation/flood-fill';
import { findBorderBundles, computeOverlap } from '../shared/game/navigation/analysis/border-bundles';
import { getScreenName } from '../shared/game/navigation/screen-names';
import { ALL_REGIONS } from '../shared/game/regions';
import { writeFileSync } from 'fs';

const rom = loadRom('./test-roms/Legend of Zelda, The - A Link to the Past (USA).sfc');
initEngine(rom);

const inventory = new Set(['lift.1']);

// ─── ROM Addresses ────────────────────────────────────────────────────────────
const ADDR_OW_ENTRANCE_AREA = 0x9BB96F;
const ADDR_OW_ENTRANCE_POS  = 0x9BBA71;
const ADDR_OW_ENTRANCE_ID   = 0x9BBB73;
const ADDR_ENTRANCE_ROOMS   = 0x82C813;

// ─── Through-Passage Detection from ROM ───────────────────────────────────────
// Exit table: room→screen mapping for rooms < 0x100
const ADDR_EXIT_ROOMS = 0x82DD8A;   // word: room ID
const ADDR_EXIT_SCREENS = 0x82DE28; // byte: OW screen
const EXIT_COUNT = 79;

const exitsByRoom = new Map<number, number>(); // room → OW screen
for (let i = 0; i < EXIT_COUNT; i++) {
  const roomId = rom.getWord(ADDR_EXIT_ROOMS + i * 2);
  const screen = rom.getByte(ADDR_EXIT_SCREENS + i);
  if (roomId < 0x100 && screen < 0x40) exitsByRoom.set(roomId, screen);
}

// Door parsing for room connectivity (Regular/Regular2 types = inter-room)
const OW_EXIT_DOOR_TYPES = new Set([0x06, 0x08, 0x0A, 0x0C, 0x0E, 0x10, 0x12, 0x14, 0x16]);
const STAIR_DOOR_TYPES_SET = new Set([0x20, 0x22, 0x24, 0x26, 0x2E, 0x36, 0x38]);

function getRoomDoorsForPassage(roomId: number): { type: number; direction: number }[] {
  const ptrAddr = 0x1f8000 + roomId * 3;
  const roomAddr = rom.getByte(ptrAddr) | (rom.getByte(ptrAddr + 1) << 8) | (rom.getByte(ptrAddr + 2) << 16);
  if (roomAddr === 0 || roomAddr === 0xffffff) return [];
  let objP = roomAddr + 2;
  const doors: { type: number; direction: number }[] = [];
  for (let layer = 0; layer < 3; layer++) {
    while (true) {
      const w = rom.getByte(objP) | (rom.getByte(objP + 1) << 8);
      if (w === 0xffff) { objP += 2; break; }
      if (w === 0xfff0) {
        objP += 2;
        while (true) {
          const dw = rom.getByte(objP) | (rom.getByte(objP + 1) << 8);
          if (dw === 0xffff) { objP += 2; break; }
          doors.push({ type: dw >> 8, direction: dw & 3 });
          objP += 2;
        }
        break;
      }
      objP += 3;
    }
  }
  return doors;
}

// Build room adjacency graph for rooms < 0x100
const passageNeighbors = new Map<number, Set<number>>();
function addPassageEdge(a: number, b: number) {
  if (!passageNeighbors.has(a)) passageNeighbors.set(a, new Set());
  passageNeighbors.get(a)!.add(b);
}

const DIR_OFFSETS = [-0x10, 0x10, -1, 1]; // N, S, W, E
const OPPOSITE_DIR = [1, 0, 3, 2];

for (let roomId = 0; roomId < 0x100; roomId++) {
  const doors = getRoomDoorsForPassage(roomId);
  const dirSet = new Set<number>();
  for (const d of doors) {
    if (!OW_EXIT_DOOR_TYPES.has(d.type) && !STAIR_DOOR_TYPES_SET.has(d.type)) {
      dirSet.add(d.direction);
    }
  }
  // Door adjacency: bidirectional check
  for (const dir of dirSet) {
    const neighbor = roomId + DIR_OFFSETS[dir];
    if (neighbor < 0 || neighbor >= 0x100) continue;
    const nDoors = getRoomDoorsForPassage(neighbor);
    const nDirSet = new Set(nDoors.filter(d => !OW_EXIT_DOOR_TYPES.has(d.type) && !STAIR_DOOR_TYPES_SET.has(d.type)).map(d => d.direction));
    if (nDirSet.has(OPPOSITE_DIR[dir])) {
      addPassageEdge(roomId, neighbor);
      addPassageEdge(neighbor, roomId);
    }
  }
  // Staircase connectivity: reciprocal header validation
  let p = 0x40000 | rom.getWord(0x4f502 + roomId * 2);
  if (p === 0x4ffef) p = 0x82edc5;
  for (let i = 0; i < 4; i++) {
    const dest = rom.getByte(p + 10 + i);
    if (dest === 0 || dest === 0xff || dest === roomId || dest >= 0x100) continue;
    let dp = 0x40000 | rom.getWord(0x4f502 + dest * 2);
    if (dp === 0x4ffef) dp = 0x82edc5;
    let reciprocal = false;
    for (let j = 0; j < 4; j++) {
      if (rom.getByte(dp + 10 + j) === roomId) { reciprocal = true; break; }
    }
    if (reciprocal) {
      addPassageEdge(roomId, dest);
      addPassageEdge(dest, roomId);
    }
  }
}

// BFS from each entrance: find screen-to-screen passages
const passageEdges = new Map<number, Set<number>>(); // screen → set of connected screens via passages
for (let i = 0; i < 129; i++) {
  const area = rom.getWord(ADDR_OW_ENTRANCE_AREA + i * 2);
  if (area >= 0x40) continue;
  const entId = rom.getByte(ADDR_OW_ENTRANCE_ID + i);
  const roomId = rom.getWord(ADDR_ENTRANCE_ROOMS + entId * 2);
  if (roomId >= 0x100) continue;

  // BFS through room graph
  const roomVisited = new Set<number>();
  const roomQueue = [roomId];
  while (roomQueue.length > 0) {
    const r = roomQueue.shift()!;
    if (roomVisited.has(r)) continue;
    roomVisited.add(r);
    if (roomVisited.size > 6) break; // safety cap

    const exitScreen = exitsByRoom.get(r);
    if (exitScreen !== undefined && exitScreen !== area) {
      if (!passageEdges.has(area)) passageEdges.set(area, new Set());
      passageEdges.get(area)!.add(exitScreen);
      if (!passageEdges.has(exitScreen)) passageEdges.set(exitScreen, new Set());
      passageEdges.get(exitScreen)!.add(area);
    }

    const neighbors = passageNeighbors.get(r);
    if (neighbors) for (const n of neighbors) {
      if (!roomVisited.has(n)) roomQueue.push(n);
    }
  }
}

// ─── Flood Fill ───────────────────────────────────────────────────────────────

interface Edge { from: number; to: number; dir: string }
const visited = new Set<number>();
const edges: Edge[] = [];
const queue: { screen: number; entry?: { row: number; col: number } }[] = [
  { screen: 0x2C, entry: { row: 50, col: 30 } }
];

while (queue.length > 0) {
  const { screen, entry } = queue.shift()!;
  if (visited.has(screen)) continue;
  visited.add(screen);

  const result = floodFillScreen(rom, screen, inventory, entry);
  const bundles = findBorderBundles(result);

  for (const bundle of bundles) {
    const row = screen >> 3, col = screen & 7;
    let ns: number | null = null;
    if (bundle.direction === 'n' && row > 0) ns = ((row - 1) << 3) | col;
    if (bundle.direction === 's' && row < 7) ns = ((row + 1) << 3) | col;
    if (bundle.direction === 'e' && col < 7) ns = (row << 3) | (col + 1);
    if (bundle.direction === 'w' && col > 0) ns = (row << 3) | (col - 1);
    if (ns === null || ns < 0 || ns > 0x3F) continue;

    const mid = bundle.tiles[Math.floor(bundle.tiles.length / 2)];
    const neighborEntry = bundle.direction === 'n' ? { row: 63, col: mid }
      : bundle.direction === 's' ? { row: 0, col: mid }
      : bundle.direction === 'e' ? { row: mid, col: 0 }
      : { row: mid, col: 63 };
    const opp = bundle.direction === 'n' ? 's' : bundle.direction === 's' ? 'n' : bundle.direction === 'e' ? 'w' : 'e';

    const nr = floodFillScreen(rom, ns, inventory, neighborEntry);
    const nb = findBorderBundles(nr).filter(b => b.direction === opp);
    let connected = false;
    for (const n of nb) {
      if (computeOverlap(bundle.tiles, n.tiles).length > 0) { connected = true; break; }
    }
    if (connected) {
      edges.push({ from: screen, to: ns, dir: bundle.direction });
      if (!visited.has(ns)) queue.push({ screen: ns, entry: neighborEntry });
    }
  }

  // Also expand through passages from this screen
  const pEdges = passageEdges.get(screen);
  if (pEdges) {
    for (const target of pEdges) {
      if (!visited.has(target)) {
        edges.push({ from: screen, to: target, dir: 'passage' });
        queue.push({ screen: target, entry: { row: 32, col: 32 } });
      }
    }
  }
}

// ─── Entrance Data from ROM ───────────────────────────────────────────────────

interface OWEntrance {
  owScreen: number;
  entranceId: number;
  roomId: number;
  gridRow: number;
  gridCol: number;
}

const owEntrances: OWEntrance[] = [];
for (let i = 0; i < 129; i++) {
  const area = rom.getWord(ADDR_OW_ENTRANCE_AREA + i * 2);
  const pos = rom.getWord(ADDR_OW_ENTRANCE_POS + i * 2);
  const entranceId = rom.getByte(ADDR_OW_ENTRANCE_ID + i);
  const roomId = rom.getWord(ADDR_ENTRANCE_ROOMS + entranceId * 2);
  const map16Row = pos >> 7;
  const map16Col = (pos & 0x7F) >> 1;
  const gridRow = (map16Row % 32) * 2;
  const gridCol = (map16Col % 32) * 2;
  if (area < 0x40) owEntrances.push({ owScreen: area, entranceId, roomId, gridRow, gridCol });
}

const entrancesByScreen = new Map<number, OWEntrance[]>();
for (const ent of owEntrances) {
  if (!entrancesByScreen.has(ent.owScreen)) entrancesByScreen.set(ent.owScreen, []);
  entrancesByScreen.get(ent.owScreen)!.push(ent);
}

// ─── ROM-Based Interior Room Graph ───────────────────────────────────────────

// Build room neighbor graph (reuse passage adjacency logic for rooms < 0x100)
const interiorNeighbors = new Map<number, Map<number, 'e'|'w'|'n'|'s'|'stair'>>();
function addInteriorEdge(a: number, b: number, dir: 'e'|'w'|'n'|'s'|'stair') {
  if (!interiorNeighbors.has(a)) interiorNeighbors.set(a, new Map());
  interiorNeighbors.get(a)!.set(b, dir);
}

const DIR_NAMES: ('n'|'s'|'w'|'e')[] = ['n', 's', 'w', 'e'];
const DIR_OFFSETS_INT = [-0x10, 0x10, -1, 1];
const OPPOSITE_DIR_INT = [1, 0, 3, 2];

for (let roomId = 0; roomId < 0x100; roomId++) {
  const doors = getRoomDoorsForPassage(roomId);
  const dirSet = new Set<number>();
  for (const d of doors) {
    if (!OW_EXIT_DOOR_TYPES.has(d.type) && !STAIR_DOOR_TYPES_SET.has(d.type)) {
      dirSet.add(d.direction);
    }
  }
  for (const dir of dirSet) {
    const neighbor = roomId + DIR_OFFSETS_INT[dir];
    if (neighbor < 0 || neighbor >= 0x100) continue;
    const nDoors = getRoomDoorsForPassage(neighbor);
    const nDirSet = new Set(nDoors.filter(d => !OW_EXIT_DOOR_TYPES.has(d.type) && !STAIR_DOOR_TYPES_SET.has(d.type)).map(d => d.direction));
    if (nDirSet.has(OPPOSITE_DIR_INT[dir])) {
      addInteriorEdge(roomId, neighbor, DIR_NAMES[dir]);
      addInteriorEdge(neighbor, roomId, DIR_NAMES[OPPOSITE_DIR_INT[dir]]);
    }
  }
  // Staircase connectivity
  let p = 0x40000 | rom.getWord(0x4f502 + roomId * 2);
  for (let i = 0; i < 4; i++) {
    const dest = rom.getByte(p + 10 + i);
    if (dest === 0 || dest === 0xff || dest === roomId || dest >= 0x100) continue;
    let dp = 0x40000 | rom.getWord(0x4f502 + dest * 2);
    let reciprocal = false;
    for (let j = 0; j < 4; j++) {
      if (rom.getByte(dp + 10 + j) === roomId) { reciprocal = true; break; }
    }
    if (reciprocal) {
      addInteriorEdge(roomId, dest, 'stair');
      addInteriorEdge(dest, roomId, 'stair');
    }
  }
}

// BFS from entrance room to find connected building
interface BuildingRoom { roomId: number; depth: number }
function bfsBuildingRooms(startRoom: number, maxDepth = 6): BuildingRoom[] {
  if (startRoom >= 0x100) return [{ roomId: startRoom, depth: 0 }];
  const visited = new Map<number, number>(); // room → depth
  const queue: BuildingRoom[] = [{ roomId: startRoom, depth: 0 }];
  while (queue.length > 0) {
    const { roomId, depth } = queue.shift()!;
    if (visited.has(roomId)) continue;
    visited.set(roomId, depth);
    if (depth >= maxDepth) continue;
    const neighbors = interiorNeighbors.get(roomId);
    if (neighbors) {
      for (const [n] of neighbors) {
        if (!visited.has(n)) queue.push({ roomId: n, depth: depth + 1 });
      }
    }
  }
  return [...visited.entries()].map(([roomId, depth]) => ({ roomId, depth }));
}

// Entrance naming: build per-entrance name lookup
// For rooms >= 0x100 (single-screen, unique), use region data directly
// For rooms < 0x100 (shared), use (screen, entranceId) context
const entranceNames = new Map<number, string>(); // entranceId → name

// Build a multimap: roomId → all regions that reference it
const roomRegions = new Map<number, Array<{ name: string; subtitle?: string; id: string; tags: readonly string[] }>>();
for (const r of ALL_REGIONS) {
  if (r.type === 'cave' && r.inGameIndex != null) {
    if (!roomRegions.has(r.inGameIndex)) roomRegions.set(r.inGameIndex, []);
    roomRegions.get(r.inGameIndex)!.push({ name: r.name, subtitle: r.subtitle, id: r.id, tags: r.tags });
  }
}

// Screen → area mapping for disambiguation (based on OW grid position)
function getScreenArea(screen: number): string {
  const row = screen >> 3;
  const col = screen & 7;
  if (row <= 1) return 'death_mountain';
  if (row === 2 && col <= 1) return 'lost_woods';
  if (row >= 3 && row <= 5 && col <= 2) return 'kakariko';
  if (row >= 5 && col >= 5) return 'lake_hylia';
  if (row >= 6 && col <= 2) return 'desert';
  if (row >= 2 && row <= 4 && col >= 5) return 'eastern_area';
  return '';
}

// For each entrance, pick the best name
for (let i = 0; i < 129; i++) {
  const area = rom.getWord(ADDR_OW_ENTRANCE_AREA + i * 2);
  if (area >= 0x40) continue;
  const entId = rom.getByte(ADDR_OW_ENTRANCE_ID + i);
  const roomId = rom.getWord(ADDR_ENTRANCE_ROOMS + entId * 2);

  const regions = roomRegions.get(roomId);
  if (!regions || regions.length === 0) {
    entranceNames.set(entId, `Room 0x${roomId.toString(16)}`);
    continue;
  }
  if (regions.length === 1) {
    entranceNames.set(entId, regions[0].subtitle || regions[0].name);
    continue;
  }
  // Ambiguous room — try to match by area tag
  const screenArea = getScreenArea(area);
  const match = regions.find(r => {
    const regionArea = r.tags.find(t => t.startsWith('area:'))?.replace('area:', '') || '';
    return regionArea === screenArea;
  });
  if (match) {
    entranceNames.set(entId, match.subtitle || match.name);
  } else {
    // No area match — use generic name
    entranceNames.set(entId, `Cave (0x${roomId.toString(16)})`);
  }
}

// ─── Build Per-Screen Interior Data ──────────────────────────────────────────

interface Building {
  name: string;
  rooms: BuildingRoom[];
  entranceRoomIds: number[]; // which rooms in this building have OW entrances
  entranceIds: number[];
}

const buildingsByScreen = new Map<number, Building[]>();

for (const [owScreen, ents] of entrancesByScreen) {
  // Find all connected components (buildings) for this screen's entrances
  const buildings: Building[] = [];
  const assignedRooms = new Map<number, number>(); // roomId → building index

  for (const ent of ents) {
    // Check if this entrance's room already belongs to an existing building
    if (assignedRooms.has(ent.roomId)) {
      const bIdx = assignedRooms.get(ent.roomId)!;
      buildings[bIdx].entranceRoomIds.push(ent.roomId);
      buildings[bIdx].entranceIds.push(ent.entranceId);
      continue;
    }

    // BFS to find all rooms in this building
    const rooms = bfsBuildingRooms(ent.roomId);

    // Check if any of these rooms overlap with an existing building
    let mergedIdx = -1;
    for (const r of rooms) {
      if (assignedRooms.has(r.roomId)) {
        mergedIdx = assignedRooms.get(r.roomId)!;
        break;
      }
    }

    if (mergedIdx >= 0) {
      // Merge into existing building
      const existing = buildings[mergedIdx];
      for (const r of rooms) {
        if (!existing.rooms.find(er => er.roomId === r.roomId)) {
          existing.rooms.push(r);
        }
        assignedRooms.set(r.roomId, mergedIdx);
      }
      existing.entranceRoomIds.push(ent.roomId);
      existing.entranceIds.push(ent.entranceId);
    } else {
      // New building
      const bIdx = buildings.length;
      for (const r of rooms) assignedRooms.set(r.roomId, bIdx);
      const name = entranceNames.get(ent.entranceId) || `Room 0x${ent.roomId.toString(16)}`;
      buildings.push({ name, rooms, entranceRoomIds: [ent.roomId], entranceIds: [ent.entranceId] });
    }
  }

  if (buildings.length > 0) buildingsByScreen.set(owScreen, buildings);
}

// ─── Interior Rendering ──────────────────────────────────────────────────────

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderBuilding(building: Building): string {
  const rooms = building.rooms;
  const isEntrance = new Set(building.entranceRoomIds);

  if (rooms.length === 1) {
    // Single room
    const r = rooms[0];
    const label = esc(building.name.slice(0, 22));
    const hasMultipleEntrances = building.entranceIds.length > 1;
    return `<div class="imap">
      <div class="imap-title">${label}</div>
      <div class="imap-grid" style="grid-template-columns:1fr;grid-template-rows:1fr 20px 14px">
        <div class="rm-cell" style="grid-row:1"><span class="rm-name">0x${r.roomId.toString(16)}</span>${hasMultipleEntrances ? `<span class="multi-ent">${building.entranceIds.length}</span>` : ''}</div>
        <div class="conn-arr" style="grid-row:2">↕</div>
        <div class="ent-sq" style="grid-row:3"></div>
      </div>
    </div>`;
  }

  // Multi-room: lay out on a grid based on room IDs (col = roomId & 0xF, row = roomId >> 4)
  // Normalize to 0-based grid
  const coords = rooms.map(r => ({
    roomId: r.roomId,
    row: r.roomId >= 0x100 ? 0 : (r.roomId >> 4),
    col: r.roomId >= 0x100 ? 0 : (r.roomId & 0xF),
  }));
  const minRow = Math.min(...coords.map(c => c.row));
  const minCol = Math.min(...coords.map(c => c.col));
  for (const c of coords) { c.row -= minRow; c.col -= minCol; }
  const maxRow = Math.max(...coords.map(c => c.row));
  const maxCol = Math.max(...coords.map(c => c.col));

  // Build grid with room cells + connection arrows between them
  const coreRows = (maxRow + 1) * 2 - 1;
  const coreCols = (maxCol + 1) * 2 - 1;
  const gRows = coreRows + 2; // +2 bottom for entrance indicator
  const gCols = Math.max(coreCols, 1);

  const colSizes: string[] = [];
  for (let c = 0; c < gCols; c++) colSizes.push(c % 2 === 0 ? '70px' : '18px');
  const rowSizes: string[] = [];
  for (let r = 0; r < coreRows; r++) rowSizes.push(r % 2 === 0 ? '42px' : '18px');
  rowSizes.push('18px', '14px'); // entrance arrow + square

  let h = `<div class="imap">
    <div class="imap-title">${esc(building.name)}</div>
    <div class="imap-grid" style="grid-template-columns:${colSizes.join(' ')};grid-template-rows:${rowSizes.join(' ')}">`;

  // Place room tiles
  for (const c of coords) {
    const gr = c.row * 2 + 1;
    const gc = c.col * 2 + 1;
    const isEnt = isEntrance.has(c.roomId);
    h += `<div class="rm-cell${isEnt ? ' rm-ent' : ''}" style="grid-row:${gr};grid-column:${gc}" title="Room 0x${c.roomId.toString(16)}">`;
    h += `<span class="rm-name">0x${c.roomId.toString(16)}</span>`;
    h += `</div>`;
  }

  // Place connection arrows between adjacent rooms
  const coordMap = new Map(coords.map(c => [c.roomId, c]));
  for (const c of coords) {
    const neighbors = interiorNeighbors.get(c.roomId);
    if (!neighbors) continue;
    for (const [nId, dir] of neighbors) {
      const nc = coordMap.get(nId);
      if (!nc) continue;
      const gr = c.row * 2 + 1;
      const gc = c.col * 2 + 1;
      const ngr = nc.row * 2 + 1;
      const ngc = nc.col * 2 + 1;
      // Only draw arrow once (from lower to higher roomId)
      if (c.roomId > nId) continue;
      const mr = Math.round((gr + ngr) / 2);
      const mc = Math.round((gc + ngc) / 2);
      const isVert = dir === 'n' || dir === 's' || dir === 'stair';
      h += `<div class="conn-arr" style="grid-row:${mr};grid-column:${mc}">${dir === 'stair' ? '⇵' : isVert ? '↕' : '↔'}</div>`;
    }
  }

  // Place entrance indicator below first entrance room
  const firstEntCoord = coords.find(c => isEntrance.has(c.roomId));
  if (firstEntCoord) {
    const gc = firstEntCoord.col * 2 + 1;
    h += `<div class="conn-arr" style="grid-row:${coreRows + 1};grid-column:${gc}">↕</div>`;
    h += `<div class="ent-sq" style="grid-row:${coreRows + 2};grid-column:${gc}"></div>`;
  }

  h += `</div></div>`;
  return h;
}

// ─── Assemble HTML ────────────────────────────────────────────────────────────

let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>ALTTP LW Flood Map</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #1a1a2e; color: #eee; font-family: 'Segoe UI', system-ui, sans-serif; padding: 20px; }
h1 { text-align: center; margin-bottom: 8px; font-size: 1.4em; color: #4ecdc4; }
.subtitle { text-align: center; color: #888; margin-bottom: 20px; font-size: 0.85em; }

/* Overworld Grid */
.ow-grid {
  display: grid; grid-template-columns: repeat(8, 1fr);
  gap: 3px; max-width: 960px; margin: 0 auto 40px;
}
.ow-cell {
  position: relative; aspect-ratio: 1.6; border-radius: 4px;
  padding: 4px 6px; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  font-size: 0.7em; border: 1px solid #333; min-height: 60px;
}
.ow-cell.reached { background: #2d6a4f; border-color: #52b788; }
.ow-cell.unreached { background: #2b2b3d; border-color: #444; color: #555; }
.ow-cell.start { background: #e63946; border-color: #ff6b6b; }
.ow-cell .hex { font-weight: bold; font-size: 0.85em; opacity: 0.8; }
.ow-cell .name { font-size: 0.75em; text-align: center; margin-top: 2px; }
.ow-cell .dirs { font-size: 0.7em; opacity: 0.6; margin-top: 2px; }
.entrance-dot {
  position: absolute; top: 4px; right: 4px;
  background: #f9c74f; color: #1a1a2e; border-radius: 50%;
  width: 16px; height: 16px; font-size: 0.7em; font-weight: bold;
  display: flex; align-items: center; justify-content: center;
}

/* Legend */
.legend { display: flex; gap: 16px; justify-content: center; margin-bottom: 20px; font-size: 0.8em; flex-wrap: wrap; }
.legend-item { display: flex; align-items: center; gap: 6px; }
.legend-swatch { width: 14px; height: 14px; border-radius: 3px; }

/* Screen Sections */
.screen-sections { max-width: 960px; margin: 0 auto; }
.screen-section { margin-bottom: 20px; border: 1px solid #333; border-radius: 6px; overflow: hidden; }
.screen-header {
  background: #2d6a4f; padding: 8px 12px;
  display: flex; align-items: center; gap: 12px;
  border-bottom: 1px solid #52b788;
}
.screen-header.unr { background: #2b2b3d; border-bottom-color: #444; }
.screen-header .sh-hex { font-weight: bold; color: #4ecdc4; }
.screen-header .sh-name { color: #d8f3dc; }
.screen-header .sh-count { margin-left: auto; color: #f9c74f; font-size: 0.85em; }
.screen-body { padding: 12px; display: flex; flex-wrap: wrap; gap: 12px; align-items: start; }

/* Interior Maps */
.imap {
  background: #16213e; border: 1px solid #2a4a7f;
  border-radius: 6px; padding: 8px 10px;
}
.imap-title { font-size: 0.7em; color: #4ecdc4; margin-bottom: 6px; font-weight: bold; text-align: center; }
.imap-grid { display: grid; gap: 2px; align-items: center; justify-items: center; }

/* Room tiles — same style as OW cells */
.rm-cell {
  position: relative;
  width: 80px; height: 50px;
  border-radius: 4px;
  background: #111; border: 3px solid #52b788;
  display: flex; align-items: center; justify-content: center;
  padding: 4px;
}
.rm-cell .rm-name {
  font-size: 0.6em; text-align: center;
  color: #d8f3dc; line-height: 1.2;
  word-break: break-word;
}
/* Drop indicator — small purple square INSIDE the tile */
.drop-ind {
  position: absolute; top: 4px; right: 4px;
  width: 12px; height: 12px;
  background: #1a1a3e; border: 2px solid #7b68ee;
  border-radius: 2px;
}

/* OW entrance squares — OUTSIDE the tile */
.ent-sq {
  width: 14px; height: 14px; border-radius: 3px;
  background: #f9c74f; border: 2px solid #f9a825;
  justify-self: center; align-self: center;
}

/* Connection arrows (between rooms and between entrance+room) */
.conn-arr {
  color: #f9a825; font-size: 1.1em; font-weight: bold;
  display: flex; align-items: center; justify-content: center;
}
/* Room that has an OW entrance */
.rm-ent { border-color: #f9c74f !important; }
/* Multiple entrance indicator */
.multi-ent {
  position: absolute; top: 2px; right: 2px;
  background: #f9c74f; color: #111; border-radius: 50%;
  width: 14px; height: 14px; font-size: 0.55em; font-weight: bold;
  display: flex; align-items: center; justify-content: center;
}
</style>
</head>
<body>
<h1>Light World Flood Map</h1>
<p class="subtitle">BFS from Link's House (0x2C) with lift.1 — ${visited.size} screens, ${edges.length} connections, ${owEntrances.length} entrances</p>

<div class="legend">
  <span class="legend-item"><span class="legend-swatch" style="background:#e63946"></span> Start</span>
  <span class="legend-item"><span class="legend-swatch" style="background:#2d6a4f;border:1px solid #52b788"></span> Reachable</span>
  <span class="legend-item"><span class="legend-swatch" style="background:#2b2b3d;border:1px solid #444"></span> Unreachable</span>
  <span class="legend-item"><span class="legend-swatch" style="background:#f9c74f;border-radius:50%"></span> OW Entrance</span>
  <span class="legend-item"><span class="legend-swatch" style="background:#1b4332;border:1px solid #52b788"></span> Connector</span>
  <span class="legend-item"><span class="legend-swatch" style="background:#3d1f00;border:1px solid #f9c74f"></span> Treasure</span>
  <span class="legend-item"><span class="legend-swatch" style="background:#1a1a3e;border:1px solid #7b68ee"></span> Drop</span>
  <span class="legend-item"><span class="legend-swatch" style="background:#1a3a2e;border:1px solid #48bfe3"></span> Safe</span>
</div>

<div class="ow-grid">
`;

for (let row = 0; row < 8; row++) {
  for (let col = 0; col < 8; col++) {
    const idx = (row << 3) | col;
    const hex = `0x${idx.toString(16).padStart(2, '0').toUpperCase()}`;
    const name = getScreenName(idx);
    const cls = idx === 0x2C ? 'start' : visited.has(idx) ? 'reached' : 'unreached';
    const screenEdges = edges.filter(e => e.from === idx);
    const dirs = screenEdges.map(e => e.dir === 'n' ? '↑' : e.dir === 's' ? '↓' : e.dir === 'e' ? '→' : e.dir === 'w' ? '←' : '⇝').join(' ');
    const entCount = entrancesByScreen.get(idx)?.length || 0;

    html += `<div class="ow-cell ${cls}">`;
    if (entCount > 0) html += `<span class="entrance-dot">${entCount}</span>`;
    html += `<span class="hex">${hex}</span>`;
    html += `<span class="name">${esc(name.length > 18 ? name.slice(0, 17) + '…' : name)}</span>`;
    if (visited.has(idx) && dirs) html += `<span class="dirs">${dirs}</span>`;
    html += `</div>\n`;
  }
}

html += `</div>
<h1 style="text-align:center;color:#4ecdc4;margin:30px 0 20px">Per-Screen Interior Maps</h1>
<div class="screen-sections">
`;

const sortedScreens = [...buildingsByScreen.keys()].sort((a, b) => a - b);
for (const owScreen of sortedScreens) {
  const buildings = buildingsByScreen.get(owScreen)!;
  const hex = `0x${owScreen.toString(16).padStart(2, '0').toUpperCase()}`;
  const name = getScreenName(owScreen);
  const isReached = visited.has(owScreen);
  const entCount = entrancesByScreen.get(owScreen)?.length || 0;

  html += `<div class="screen-section">`;
  html += `<div class="screen-header${isReached ? '' : ' unr'}">`;
  html += `<span class="sh-hex">${hex}</span><span class="sh-name">${esc(name)}</span>`;
  html += `<span class="sh-count">${entCount} entrance${entCount !== 1 ? 's' : ''}</span>`;
  html += `</div><div class="screen-body">`;

  for (const building of buildings) {
    html += renderBuilding(building);
  }

  html += `</div></div>\n`;
}

html += `</div></body></html>`;

writeFileSync('scripts/lw-flood-map.html', html);
console.log(`HTML written: scripts/lw-flood-map.html`);
console.log(`Reached: ${visited.size}, Edges: ${edges.length}`);
console.log(`LW Entrances: ${owEntrances.length}, Screens with interiors: ${buildingsByScreen.size}`);
