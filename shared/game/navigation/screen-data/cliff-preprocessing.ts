import type { TilePassability, LedgeTraversal } from '../types';
import { GRID_SIZE } from '../types';

/**
 * Straight cliff-jump preprocessing.
 * Converts cliff triggers (0x28-0x2b, 0x2f) into directional ledge tiles
 * when they have 2-tile perpendicular width.
 */
export function processStraightCliffs(
  grid: TilePassability[][],
  rawAttr: number[][],
  ledges: LedgeTraversal[],
): void {
  const CLIFF_TRIGGERS = new Set([0x28, 0x29, 0x2a, 0x2b, 0x2f]);
  const CLIFF_DIRS: Record<number, { dr: number; dc: number; dir: 'n' | 's' | 'e' | 'w' }> = {
    0x28: { dr: -1, dc: 0, dir: 'n' },
    0x29: { dr: 1, dc: 0, dir: 's' },
    0x2a: { dr: 0, dc: -1, dir: 'w' },
    0x2b: { dr: 0, dc: 1, dir: 'e' },
    0x2f: { dr: 0, dc: 1, dir: 'e' },
  };
  const CLIFF_WALL = new Set([0x01, 0x02, 0x03, 0x1a, 0x12]);

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const attr = rawAttr[row][col];
      if (!CLIFF_TRIGGERS.has(attr)) continue;

      const { dr, dc, dir } = CLIFF_DIRS[attr];

      // Check 2-tile perpendicular width
      let has2Wide = false;
      if (dr !== 0) {
        if (col > 0 && (CLIFF_TRIGGERS.has(rawAttr[row][col - 1]) || CLIFF_WALL.has(rawAttr[row][col - 1]))) has2Wide = true;
        if (col < 63 && (CLIFF_TRIGGERS.has(rawAttr[row][col + 1]) || CLIFF_WALL.has(rawAttr[row][col + 1]))) has2Wide = true;
      } else {
        if (row > 0 && (CLIFF_TRIGGERS.has(rawAttr[row - 1][col]) || CLIFF_WALL.has(rawAttr[row - 1][col]))) has2Wide = true;
        if (row < 63 && (CLIFF_TRIGGERS.has(rawAttr[row + 1][col]) || CLIFF_WALL.has(rawAttr[row + 1][col]))) has2Wide = true;
      }
      if (!has2Wide) continue;

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
}

/**
 * Diagonal cliff-jump preprocessing.
 * Converts zigzag cliff paths (0x2c=NW, 0x2d=SE, 0x2e=NE) into diagonal ledges.
 */
export function processDiagonalCliffs(
  grid: TilePassability[][],
  rawAttr: number[][],
  ledges: LedgeTraversal[],
): void {
  const DIAG_CLIFF_TILES = new Set([0x2c, 0x2d, 0x2e, 0x1a, 0x12]);
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
        const hasApproach =
          (approachR1 >= 0 && approachR1 < GRID_SIZE && approachC1 >= 0 && approachC1 < GRID_SIZE && grid[approachR1][approachC1].type === 'free') ||
          (approachR2 >= 0 && approachR2 < GRID_SIZE && approachC2 >= 0 && approachC2 < GRID_SIZE && grid[approachR2][approachC2].type === 'free');
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
}

/**
 * South-cliff scan from diagonal edge tiles and cliff borders.
 * Detects southward cliff jumps where edge tiles have cliff face below.
 */
export function processSouthCliffs(
  grid: TilePassability[][],
  rawAttr: number[][],
  ledges: LedgeTraversal[],
): void {
  const DIAG_EDGE_ATTRS = new Set([0x2c, 0x2d, 0x2e, 0x2f, 0x1a]);
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
}
