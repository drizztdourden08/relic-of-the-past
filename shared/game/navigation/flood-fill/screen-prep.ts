/* @layer shared-game @kind logic */
/** Collision-grid preparation, void constraint, and start-position search for flood-fill. */
import type { LedgeTraversal, GridPos, CollisionGrid } from '../types';
import { GRID_SIZE } from '../types';
import { buildCollisionGridFromRawAttr } from '../screen-data/collision-grid';
import { processStraightCliffs, processDiagonalCliffs, processSouthCliffs } from '../screen-data/cliff-preprocessing';

const prepareScreen = (rawAttrGrid: number[][], indoors: boolean, dynamicBlockers?: GridPos[], skipCliffs = false): { grid: CollisionGrid; ledges: LedgeTraversal[]; dynamicBlockerCells: GridPos[] } => {
  const dynamicBlockerCells: GridPos[] = [];
  const grid = buildCollisionGridFromRawAttr(rawAttrGrid, indoors);

  // Apply dynamic blockers (uncle, guards, etc.)
  if (dynamicBlockers?.length) {
    const seen = new Set<string>();
    for (const b of dynamicBlockers) {
      for (let dr = 0; dr < 2; dr++) {
        for (let dc = 0; dc < 2; dc++) {
          const rr = b.row + dr;
          const cc = b.col + dc;
          if (rr < 0 || rr >= GRID_SIZE || cc < 0 || cc >= GRID_SIZE) continue;
          grid.rawAttr[rr][cc] = 0x01;
          grid.tiles[rr][cc] = { type: 'blocked' };
          const key = `${rr},${cc}`;
          if (!seen.has(key)) {
            seen.add(key);
            dynamicBlockerCells.push({ row: rr, col: cc });
          }
        }
      }
    }
  }

  // Cliff preprocessing (ledge one-way traversals) — skip for layer 1 (no cliffs there)
  const ledges: LedgeTraversal[] = [];
  if (!skipCliffs) {
    processStraightCliffs(grid.tiles, grid.rawAttr, ledges, indoors);
    processDiagonalCliffs(grid.tiles, grid.rawAttr, ledges);
    processSouthCliffs(grid.tiles, grid.rawAttr, ledges);
  } else {
    // On layer 1 (lower floor), cliff-trigger tiles are normal ground.
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const attr = grid.rawAttr[r][c];
        if (attr >= 0x28 && attr <= 0x2B) {
          grid.tiles[r][c] = { type: 'free' };
        }
      }
    }
  }

  return { grid, ledges, dynamicBlockerCells };
};

/** Max boundary-gap width still considered a doorway (standard dungeon passages are 4 tiles). */
const DOORWAY_MAX_WIDTH = 6;

/**
 * Boundary 0x00 cells that are safe to seed the void flood from. Walkable exit corridors
 * (room transitions) reach the grid edge as narrow, wall-flanked gaps — standard dungeon
 * doorways are 4 tiles wide — and must NOT seed the flood, or it walks up the corridor and
 * wipes the room's real floor (e.g. room 0x72's lower floor via its open south passage).
 * Structural void touches the edge in wide open spans, which do seed.
 */
const collectVoidSeeds = (layer: number[][]): Array<[number, number]> => {
  const seeds: Array<[number, number]> = [];
  const edges: Array<{ at: (i: number) => [number, number] }> = [
    { at: (i) => [0, i] },              // north edge
    { at: (i) => [GRID_SIZE - 1, i] },  // south edge
    { at: (i) => [i, 0] },              // west edge
    { at: (i) => [i, GRID_SIZE - 1] },  // east edge
  ];

  for (const edge of edges) {
    let runStart = -1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      const isOpen = i < GRID_SIZE && layer[edge.at(i)[0]][edge.at(i)[1]] === 0x00;
      if (isOpen && runStart < 0) runStart = i;
      if (isOpen || runStart < 0) continue;

      // Run [runStart, i) ended — a doorway needs walls on BOTH flanks (grid corners don't count).
      const runLen = i - runStart;
      const hasFlankBefore = runStart > 0;
      const hasFlankAfter = i < GRID_SIZE;
      const isDoorway = runLen <= DOORWAY_MAX_WIDTH && hasFlankBefore && hasFlankAfter;
      if (!isDoorway) {
        for (let j = runStart; j < i; j++) seeds.push(edge.at(j));
      }
      runStart = -1;
    }
  }
  return seeds;
};

const constrainVoidTiles = (thisLayer: number[][], _otherLayer: number[][]): number[][] => {
  // Step 1: Flood from boundary through 0x00 tiles to find void-connected regions,
  // seeding only from wide-open boundary spans (doorway gaps are walkable exits).
  const isVoid: boolean[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
  const queue: Array<[number, number]> = [];

  for (const [r, c] of collectVoidSeeds(thisLayer)) {
    if (isVoid[r][c]) continue;
    isVoid[r][c] = true;
    queue.push([r, c]);
  }
  while (queue.length > 0) {
    const [qr, qc] = queue.shift()!;
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
      const nr = qr + dr, nc = qc + dc;
      if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) continue;
      if (isVoid[nr][nc]) continue;
      if (thisLayer[nr][nc] !== 0x00) continue;
      isVoid[nr][nc] = true;
      queue.push([nr, nc]);
    }
  }

  // Step 2: Copy grid, replacing void tiles with solid wall (0x01)
  return Array.from({ length: GRID_SIZE }, (_, r) =>
    Array.from({ length: GRID_SIZE }, (_, c) =>
      isVoid[r][c] ? 0x01 : thisLayer[r][c]
    ),
  );
};

const findStartPosition = (grid: CollisionGrid, startPos?: GridPos): GridPos => {
  const row = Math.max(0, Math.min(GRID_SIZE - 1, startPos?.row ?? 32));
  const col = Math.max(0, Math.min(GRID_SIZE - 1, startPos?.col ?? 32));

  // Prefer local tiles first (requested tile + immediate neighbors), center-biased.
  const local: GridPos[] = [
    { row, col },
    { row, col: col + 1 },
    { row, col: col - 1 },
    { row: row + 1, col },
    { row: row - 1, col },
    { row: row + 1, col: col + 1 },
    { row: row + 1, col: col - 1 },
    { row: row - 1, col: col + 1 },
    { row: row - 1, col: col - 1 },
  ];
  for (const p of local) {
    if (p.row >= 0 && p.row < GRID_SIZE && p.col >= 0 && p.col < GRID_SIZE && grid.tiles[p.row][p.col].type === 'free') {
      return p;
    }
  }

  // Fallback: pick nearest free tile to the geometric center of Link's 2x2 footprint.
  const centerRow = row + 0.5;
  const centerCol = col + 0.5;
  let best: GridPos | null = null;
  let bestD2 = Number.POSITIVE_INFINITY;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid.tiles[r][c].type !== 'free') continue;
      const dr = r - centerRow;
      const dc = c - centerCol;
      const d2 = dr * dr + dc * dc;
      if (d2 < bestD2) {
        bestD2 = d2;
        best = { row: r, col: c };
      }
    }
  }
  if (best) return best;

  return { row, col };
};

export { prepareScreen, constrainVoidTiles, findStartPosition };
