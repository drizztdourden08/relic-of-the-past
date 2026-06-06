import type { TilePassability, LedgeTraversal } from '../types';
import { GRID_SIZE } from '../types';

const processStraightCliffs = (grid: TilePassability[][], rawAttr: number[][], ledges: LedgeTraversal[], isIndoors = false): void => {
  const CLIFF_TRIGGERS = new Set([0x28, 0x29, 0x2a, 0x2b, 0x2f]);
  // Horizontal ledge attrs (0x2a/0x2b) — direction inferred from surrounding walls
  const HORIZ_LEDGE_ATTRS = new Set([0x2a, 0x2b]);
  // Vertical ledge attrs (0x28/0x29) — direction inferred from surrounding walls
  const VERT_LEDGE_ATTRS = new Set([0x28, 0x29]);
  // Outdoors: fixed directions; Indoors: 0x28/0x29/0x2a/0x2b use wall inference, only 0x2f is hardcoded
  const CLIFF_DIRS: Record<number, { dr: number; dc: number; dir: 'n' | 's' | 'e' | 'w' }> = isIndoors
    ? {
        0x2f: { dr: 0, dc: -1, dir: 'w' },
      }
    : {
        0x28: { dr: -1, dc: 0, dir: 'n' },
        0x29: { dr: 1, dc: 0, dir: 's' },
        0x2a: { dr: 0, dc: -1, dir: 'w' },
        0x2b: { dr: 0, dc: 1, dir: 'e' },
        0x2f: { dr: 0, dc: 1, dir: 'e' },
      };
  // Indoor walls include 0x04 (thick grass outdoors = wall indoors)
  const CLIFF_WALL = isIndoors
    ? new Set([0x01, 0x02, 0x03, 0x04, 0x1a, 0x12, 0x13, 0x1b])
    : new Set([0x01, 0x02, 0x03, 0x1a, 0x12, 0x13, 0x1b]);

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const attr = rawAttr[row][col];
      if (!CLIFF_TRIGGERS.has(attr)) continue;

      let dr: number, dc: number, dir: 'n' | 's' | 'e' | 'w';

      if (isIndoors && HORIZ_LEDGE_ATTRS.has(attr)) {
        // 0x2a/0x2b indoor: direction inferred from which side has the cliff face (walls).
        // The jump goes TOWARD the wall/cliff face and over it.
        const hasWallEast = col < 63 && CLIFF_WALL.has(rawAttr[row][col + 1]);
        const hasWallWest = col > 0 && CLIFF_WALL.has(rawAttr[row][col - 1]);
        if (hasWallEast && !hasWallWest) {
          dr = 0; dc = 1; dir = 'e';
        } else if (hasWallWest && !hasWallEast) {
          dr = 0; dc = -1; dir = 'w';
        } else {
          // Ambiguous — check further for walls
          let wallsEast = 0, wallsWest = 0;
          for (let d = 1; d <= 3 && col + d < GRID_SIZE; d++) {
            if (CLIFF_WALL.has(rawAttr[row][col + d])) wallsEast++;
          }
          for (let d = 1; d <= 3 && col - d >= 0; d++) {
            if (CLIFF_WALL.has(rawAttr[row][col - d])) wallsWest++;
          }
          if (wallsEast > wallsWest) {
            dr = 0; dc = 1; dir = 'e';
          } else if (wallsWest > wallsEast) {
            dr = 0; dc = -1; dir = 'w';
          } else {
            // Default fallback: east
            dr = 0; dc = 1; dir = 'e';
          }
        }
      } else if (isIndoors && VERT_LEDGE_ATTRS.has(attr)) {
        // 0x28/0x29 indoor: direction inferred from which side has the cliff face (walls).
        // The jump goes TOWARD the wall/cliff face and over it.
        const hasWallSouth = row < 63 && CLIFF_WALL.has(rawAttr[row + 1][col]);
        const hasWallNorth = row > 0 && CLIFF_WALL.has(rawAttr[row - 1][col]);
        if (hasWallSouth && !hasWallNorth) {
          dr = 1; dc = 0; dir = 's';
        } else if (hasWallNorth && !hasWallSouth) {
          dr = -1; dc = 0; dir = 'n';
        } else {
          // Ambiguous — check further for walls
          let wallsSouth = 0, wallsNorth = 0;
          for (let d = 1; d <= 3 && row + d < GRID_SIZE; d++) {
            if (CLIFF_WALL.has(rawAttr[row + d][col])) wallsSouth++;
          }
          for (let d = 1; d <= 3 && row - d >= 0; d++) {
            if (CLIFF_WALL.has(rawAttr[row - d][col])) wallsNorth++;
          }
          if (wallsSouth > wallsNorth) {
            dr = 1; dc = 0; dir = 's';
          } else if (wallsNorth > wallsSouth) {
            dr = -1; dc = 0; dir = 'n';
          } else {
            // Default fallback: south
            dr = 1; dc = 0; dir = 's';
          }
        }
      } else {
        const fixed = CLIFF_DIRS[attr];
        if (!fixed) continue;
        ({ dr, dc, dir } = fixed);
      }

      // Check 2-tile perpendicular width
      let has2Wide = false;
      if (dr !== 0) {
        if (col > 0 && (CLIFF_TRIGGERS.has(rawAttr[row][col - 1]) || CLIFF_WALL.has(rawAttr[row][col - 1]))) has2Wide = true;
        if (col < 63 && (CLIFF_TRIGGERS.has(rawAttr[row][col + 1]) || CLIFF_WALL.has(rawAttr[row][col + 1]))) has2Wide = true;
      } else {
        if (row > 0 && (CLIFF_TRIGGERS.has(rawAttr[row - 1][col]) || CLIFF_WALL.has(rawAttr[row - 1][col]))) has2Wide = true;
        if (row < 63 && (CLIFF_TRIGGERS.has(rawAttr[row + 1][col]) || CLIFF_WALL.has(rawAttr[row + 1][col]))) has2Wide = true;
      }
      if (!has2Wide && !isIndoors) continue;

      grid[row][col] = { type: 'ledge', dir };
      let r = row + dr;
      let c = col + dc;
      while (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && CLIFF_WALL.has(rawAttr[r][c])) {
        grid[r][c] = { type: 'ledge', dir };
        r += dr;
        c += dc;
      }
      ledges.push({ startRow: row, startCol: col, endRow: r, endCol: c });
    }
  }
};

const processDiagonalCliffs = (grid: TilePassability[][], rawAttr: number[][], ledges: LedgeTraversal[]): void => {
  const DIAG_CLIFF_TILES = new Set([0x2c, 0x2d, 0x2e, 0x1a, 0x12, 0x13, 0x1b]);
  const DIAG_TRIGGERS: Record<number, { dir: 'ne' | 'nw' | 'se' | 'sw'; d1: [number, number]; d2: [number, number] }> = {
    0x2c: { dir: 'nw', d1: [-1, 0], d2: [0, -1] },
    0x2d: { dir: 'se', d1: [1, 0], d2: [0, 1] },
    0x2e: { dir: 'ne', d1: [-1, 0], d2: [0, 1] },
  };

  // Process in priority order to prevent tile-claiming conflicts
  for (const triggerAttr of [0x2c, 0x2d, 0x2e]) {
    const { dir, d1, d2 } = DIAG_TRIGGERS[triggerAttr];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (rawAttr[row][col] !== triggerAttr) continue;
        if (grid[row][col].type === 'ledge') continue;

        // Approach check: must have a free tile on the entry side
        const approachR1 = row - d1[0], approachC1 = col - d1[1];
        const approachR2 = row - d2[0], approachC2 = col - d2[1];
        const isApproachable = (r: number, c: number) =>
          r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE &&
          (grid[r][c].type === 'free' || DIAG_CLIFF_TILES.has(rawAttr[r][c]));
        const hasApproach = isApproachable(approachR1, approachC1) || isApproachable(approachR2, approachC2);
        if (!hasApproach) continue;

        // Follow zigzag path
        const path: [number, number][] = [[row, col]];
        let r = row, c = col;
        for (let steps = 0; steps < 12; steps++) {
          let nr = r + d1[0], nc = c + d1[1];
          if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && DIAG_CLIFF_TILES.has(rawAttr[nr][nc]) && grid[nr][nc].type !== 'ledge') {
            path.push([nr, nc]); r = nr; c = nc; continue;
          }
          nr = r + d2[0]; nc = c + d2[1];
          if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && DIAG_CLIFF_TILES.has(rawAttr[nr][nc]) && grid[nr][nc].type !== 'ledge') {
            path.push([nr, nc]); r = nr; c = nc; continue;
          }
          break;
        }

        if (path.length < 2) continue;

        // Must span both rows AND columns to be diagonal
        const minR = Math.min(...path.map(p => p[0])), maxR = Math.max(...path.map(p => p[0]));
        const minC = Math.min(...path.map(p => p[1])), maxC = Math.max(...path.map(p => p[1]));
        if (minR === maxR || minC === maxC) continue;

        for (const [pr, pc] of path) { grid[pr][pc] = { type: 'ledge', dir }; }

        // Determine landing position
        let endR = r + d2[0], endC = c + d2[1];
        if (!(endR >= 0 && endR < GRID_SIZE && endC >= 0 && endC < GRID_SIZE && grid[endR][endC].type === 'free')) {
          endR = r + d1[0]; endC = c + d1[1];
        }
        if (!(endR >= 0 && endR < GRID_SIZE && endC >= 0 && endC < GRID_SIZE)) {
          endR = r; endC = c;
        }
        ledges.push({ startRow: row, startCol: col, endRow: endR, endCol: endC });
      }
    }
  }
};

const processSouthCliffs = (grid: TilePassability[][], rawAttr: number[][], ledges: LedgeTraversal[]): void => {
  const DIAG_EDGE_ATTRS = new Set([0x2c, 0x2d, 0x2e, 0x1a]);
  const CLIFF_BORDER_ATTRS = new Set([0x10, 0x18]);

  const isSouthCliffTile = (r: number, c: number) =>
    grid[r][c].type === 'blocked' || (grid[r][c].type === 'ledge' && (grid[r][c] as { dir: string }).dir === 's');

  for (let row = 0; row < GRID_SIZE - 1; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const attr = rawAttr[row][col];
      const isDiagEdge = DIAG_EDGE_ATTRS.has(attr);
      const isCliffBorder = CLIFF_BORDER_ATTRS.has(attr) && row > 0 &&
        (grid[row - 1][col].type === 'free' || grid[row - 1][col].type === 'ledge');

      if (!isDiagEdge && !isCliffBorder) continue;
      if (!isSouthCliffTile(row + 1, col)) continue;

      if (grid[row][col].type === 'blocked') {
        grid[row][col] = { type: 'free' };
      }

      let r = row + 1;
      while (r < GRID_SIZE && isSouthCliffTile(r, col)) {
        if (grid[r][col].type === 'blocked') {
          grid[r][col] = { type: 'ledge', dir: 's' };
        }
        r++;
      }
      if (r > row + 1 && r < GRID_SIZE) {
        ledges.push({ startRow: row, startCol: col, endRow: r, endCol: col });
      }
    }
  }
};

export { processStraightCliffs, processDiagonalCliffs, processSouthCliffs };
