/* @layer shared-game @kind logic */
import type { TilePassability, LedgeTraversal } from '../types';
import { GRID_SIZE } from '../types';
import { computeIndoorLedgeDirs, HORIZ_LEDGE_ATTRS, VERT_LEDGE_ATTRS } from './indoor-ledge-dirs';

/** Every tile of the screen, row-major. */
const allTiles = function* (): Generator<[number, number]> {
  for (let r = 0; r < GRID_SIZE; r++) for (let c = 0; c < GRID_SIZE; c++) yield [r, c];
};

const processStraightCliffs = (grid: TilePassability[][], rawAttr: number[][], ledges: LedgeTraversal[], isIndoors = false): void => {
  const CLIFF_TRIGGERS = new Set([0x28, 0x29, 0x2a, 0x2b]);
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
      };
  // Indoor walls include 0x04 (thick grass outdoors = wall indoors)
  const CLIFF_WALL = isIndoors
    ? new Set([0x01, 0x02, 0x03, 0x04, 0x1a, 0x12, 0x13, 0x1b])
    : new Set([0x01, 0x02, 0x03, 0x1a, 0x12, 0x13, 0x1b]);

  // Indoor 0x28/0x29/0x2a/0x2b: precompute every trigger's inferred direction so each
  // can check its neighbors' directions, not just their attrs.
  const indoorDirs = isIndoors ? computeIndoorLedgeDirs(rawAttr, CLIFF_WALL) : null;

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const attr = rawAttr[row][col];
      if (!CLIFF_TRIGGERS.has(attr)) continue;

      let dr: number, dc: number, dir: 'n' | 's' | 'e' | 'w';

      if (indoorDirs && (HORIZ_LEDGE_ATTRS.has(attr) || VERT_LEDGE_ATTRS.has(attr))) {
        ({ dr, dc, dir } = indoorDirs.get(row * GRID_SIZE + col)!);

        // The player's body is 2 tiles wide, so a jump exists only where an adjacent
        // trigger jumps the SAME way AND is itself standable: its approach tile (one
        // step back against the jump direction) must not be a wall.
        const [pr, pc] = dr !== 0 ? [0, 1] : [1, 0];
        const pairs = (r2: number, c2: number): boolean => {
          if (indoorDirs.get(r2 * GRID_SIZE + c2)?.dir !== dir) return false;
          const ar = r2 - dr, ac = c2 - dc;
          return ar >= 0 && ar < GRID_SIZE && ac >= 0 && ac < GRID_SIZE && !CLIFF_WALL.has(rawAttr[ar][ac]);
        };
        if (!pairs(row - pr, col - pc) && !pairs(row + pr, col + pc)) continue;
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

/**
 * Diagonal cliff jumps, mirroring the game's own search. Every constant is
 * transcribed from the decompilation; inferring them produced wrong answers.
 *
 *   tile_detect.c:355   0x2c/0x2e are ONE bucket (Ledge_NorthDiagonal), 0x2d/0x2f
 *                       another. The tile decides north vs south and NOTHING else.
 *   player.c:4567       the sideways half comes from which corner of the body
 *                       touched the trigger, i.e. the side walked in from.
 *   player.c:1115       LinkHop_FindLandingSpotDiagonallyDown steps x by +/-8 and
 *                       y by -/+9 per iteration, unbounded, until the landing test passes.
 *   tile_detect.c:35    that test samples THREE points on one row (x+0 bit 1, x+8
 *                       bit 2, x+15 bit 4, at y+8) and requires mask 6 travelling
 *                       west or 3 travelling east: the trailing side of the hop.
 *   player.c:1130       landable ground is normal tiles, destruction aftermath,
 *                       thick grass AND deep water (landing in water starts a swim).
 */
const processDiagonalCliffs = (grid: TilePassability[][], rawAttr: number[][], ledges: LedgeTraversal[]): void => {
  /** Vertical half of the hop. The tile itself decides this much and no more. */
  const VERTICAL: Record<number, -1 | 1> = { 0x2c: -1, 0x2e: -1, 0x2d: 1, 0x2f: 1 };
  const NAME: Record<string, 'ne' | 'nw' | 'se' | 'sw'> = {
    '-1,-1': 'nw', '-1,1': 'ne', '1,-1': 'sw', '1,1': 'se',
  };
  const TILE = 8;
  /** kDetectTiles_tab1/2/3 for a vertical probe: the three sampled columns. */
  const SAMPLE_DX = [0, 8, 15] as const;
  /** The sampled row, one tile below the position (kDetectTiles_tab0[0]). */
  const SAMPLE_DY = 8;
  /** kLink_Ledge_Func1_bits: travelling west needs middle+right, east left+middle. */
  const NEED_WEST = 0b110;
  const NEED_EAST = 0b011;
  /** Our own guard. The game's loop is unbounded; leaving the screen ends ours. */
  const MAX_STEPS = 64;

  const inGrid = (r: number, c: number): boolean => r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE;
  /** tiledetect_normal_tiles | aftermath | thick_grass | deepwater. Never the cliff. */
  const landable = (r: number, c: number): boolean => {
    if (!inGrid(r, c)) return false;
    const t = grid[r][c].type;
    return t === 'free' || t === 'water';
  };
  /** Ground the player can stand on to set a jump off; a trigger tile counts,
   *  since walking onto one is how it fires. */
  const standable = (r: number, c: number): boolean => {
    if (!inGrid(r, c)) return false;
    const t = grid[r][c].type;
    if (t === 'free' || t === 'ledge') return true;
    const a = rawAttr[r][c];
    return a >= 0x28 && a <= 0x2f;
  };
  /** The player is 2x2, so any footing needs a body-sized patch. */
  const bodyOn = (r: number, c: number, ok: (rr: number, cc: number) => boolean): boolean => {
    for (const [br, bc] of [[r, c], [r - 1, c], [r, c - 1], [r - 1, c - 1]]) {
      if (!inGrid(br, bc) || !inGrid(br + 1, bc + 1)) continue;
      if (ok(br, bc) && ok(br, bc + 1) && ok(br + 1, bc) && ok(br + 1, bc + 1)) return true;
    }
    return false;
  };
  const bodyStands = (r: number, c: number): boolean => bodyOn(r, c, standable);

  /** LinkHop_FindLandingSpotDiagonallyDown, in tile space. Null when it leaves the screen. */
  const findLanding = (row: number, col: number, dv: -1 | 1, dh: -1 | 1): { row: number; col: number } | null => {
    const need = dh < 0 ? NEED_WEST : NEED_EAST;
    let x = col * TILE;
    let y = row * TILE;
    for (let step = 0; step < MAX_STEPS; step++) {
      x += dh * TILE;
      y += dv * 9;
      const sr = (y + SAMPLE_DY) >> 3;
      if (!inGrid(sr, x >> 3)) return null;
      let got = 0;
      SAMPLE_DX.forEach((dx, i) => { if (landable(sr, (x + dx) >> 3)) got |= 1 << i; });
      const arrived = (got & need) === need;
      // A hop has to CLEAR something. Landing on the very first step means no
      // face was in the way, so it is not a jump. This once put a stray diagonal
      // on the corner tile where a straight cliff meets a diagonal one.
      if (arrived) return step === 0 ? null : { row: sr, col: x >> 3 };
    }
    return null;
  };

  for (const [row, col] of allTiles()) {
    const dv = VERTICAL[rawAttr[row][col]];
    if (dv === undefined) continue;
    // Both approach sides, because the tile does not say which. Both are usually
    // standable (a trigger tile is walkable), so footing alone cannot say which
    // way the player came from. Distance can: a hop ACROSS a face lands in a step
    // or two, a hop ALONG it travels its whole length. Keep the shorter.
    let best: { dh: -1 | 1; row: number; col: number; steps: number; solid: boolean } | null = null;
    for (const dh of [-1, 1] as const) {
      const loose = bodyStands(row, col - dh) || bodyStands(row - dv, col - dh);
      if (!loose) continue;
      const land = findLanding(row, col, dv, dh);
      if (!land) continue;
      // Footing on OPEN ground outranks footing that is only more cliff; with
      // equal distances the tie otherwise fell to whichever side was tested first.
      const solid = bodyOn(row, col - dh, landable) || bodyOn(row - dv, col - dh, landable);
      const steps = Math.abs(land.col - col);
      const better = !best
        || (solid !== best.solid ? solid : steps < best.steps);
      if (better) best = { dh, row: land.row, col: land.col, steps, solid };
    }
    if (!best) continue;
    if (grid[row][col].type !== 'ledge') grid[row][col] = { type: 'ledge', dir: NAME[`${dv},${best.dh}`] };
    ledges.push({ startRow: row, startCol: col, endRow: best.row, endCol: best.col });
  }
};

const processSouthCliffs = (grid: TilePassability[][], rawAttr: number[][], ledges: LedgeTraversal[]): void => {
  // Nothing seeds a south run except a south-facing border below. Only 0x28-0x2f
  // trigger a jump (tile_detect.c); a cliff FACE is scenery the arc passes over.
  // Seeding from a diagonal trigger or the west face 0x1a re-emitted tiles the
  // diagonal pass had already claimed as straight drops.
  const DIAG_EDGE_ATTRS = new Set<number>();
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
