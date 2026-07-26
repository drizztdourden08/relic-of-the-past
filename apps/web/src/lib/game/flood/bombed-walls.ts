/* @layer bridge-wasm @kind logic */
/**
 * Walls the run has blown open.
 *
 * A cracked wall is tile attr 0xF0-0xFF (`TileBehavior_FlaggableDoor`) — solid
 * until its flag is set, and the flag is set by blasting it. The flood models it
 * as `pass: 'obstacle', req: 'bombs'`, which lets the player STAND on the wall
 * once bombs are carried but not continue past it: on the village well that
 * moves the flood's top edge two rows and stops, 29 rows short of the chest
 * behind it. Standing on a wall is not what the game does — bombing turns it
 * into floor, permanently, and that is a state change rather than a
 * requirement.
 *
 * So the run bombs it: discovery offers the wall as a target once bombs are in
 * hand, triggering records it here, and every subsequent grid build stamps those
 * cells walkable. The same shape as `stampIndoorBlockers`, which already edits
 * grids on the way out of `getScreenGrids`.
 *
 * ⚠️ This is sim-side state, not a game write. Every other trigger pokes real
 * SRAM; the tilemap swap a real bomb performs happens in the explosion path and
 * has no addressable equivalent to write. So the run's belief here is a MODEL,
 * and the widget reads the same registry so at least both agree.
 *
 * Bombs are treated as permanent once obtained — the first pickup means every
 * cracked wall from then on is openable, with no count kept.
 */
import type { GridPos } from '@shared/game/navigation';

/** Cracked-wall attrs: solid until flagged (see interior-attrs.ts). */
const BOMBABLE_ATTR_MIN = 0xf0;
const BOMBABLE_ATTR_MAX = 0xff;
/** A blast opens the whole cracked patch, not one 8px cell. */
const BLAST_RADIUS = 2;
const GRID = 64;

const bombed = new Map<number, Set<string>>();

const cellKey = (row: number, col: number): string => `${row},${col}`;

const isBombableAttr = (attr: number): boolean => attr >= BOMBABLE_ATTR_MIN && attr <= BOMBABLE_ATTR_MAX;

/** Record a blast at `tile` in `roomId`, opening the patch around it. */
const markBombed = (roomId: number, tile: GridPos): void => {
  const set = bombed.get(roomId) ?? new Set<string>();
  for (let dr = -BLAST_RADIUS; dr <= BLAST_RADIUS; dr++) {
    for (let dc = -BLAST_RADIUS; dc <= BLAST_RADIUS; dc++) {
      const row = tile.row + dr;
      const col = tile.col + dc;
      if (row >= 0 && row < GRID && col >= 0 && col < GRID) set.add(cellKey(row, col));
    }
  }
  bombed.set(roomId, set);
};

const isBombed = (roomId: number, tile: GridPos): boolean =>
  bombed.get(roomId)?.has(cellKey(tile.row, tile.col)) === true;

/** Turn every recorded blast cell that still reads as a cracked wall into floor. */
const stampBombedWalls = (roomId: number, grids: number[][][]): void => {
  const set = bombed.get(roomId);
  if (!set) return;
  for (const key of set) {
    const [row, col] = key.split(',').map(Number);
    for (const grid of grids) {
      if (isBombableAttr(grid[row]?.[col] ?? 0)) grid[row][col] = 0x00;
    }
  }
};

/** Cleared between runs so one run's blasts never leak into the next. */
const resetBombedWalls = (): void => { bombed.clear(); };

export { markBombed, isBombed, stampBombedWalls, resetBombedWalls, isBombableAttr, BOMBABLE_ATTR_MIN, BOMBABLE_ATTR_MAX };
