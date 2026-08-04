/* @layer bridge-wasm @kind logic */
/**
 * Marks an annotation `blocked` when the flood cannot actually walk to it.
 *
 * The Secret Passage is the case that forced this: the uncle stands in the
 * corridor, the flood correctly stops at him, but the chest behind him was still
 * listed as an available check. A thing the run cannot reach must not read as
 * available — the panel now says so instead of silently promising it.
 *
 * A feature's own tile is often solid (a chest IS a wall tile, a door IS the
 * doorway), so reachability is judged over the tiles AROUND it, not the tile
 * itself: if any neighbour within `TOUCH` is reachable, the player can interact.
 */
import type { ScreenAnnotation } from '@shared/game/simulation';
import type { ReachState } from '@shared/game/navigation/types';

/** How far from the marker a walkable tile counts as "can interact". */
const TOUCH = 2;

/**
 * Screen-wide facts carry a placeholder tile (0,0) because they describe the whole
 * room, so reachability says nothing about them — judging them would label every
 * kill-gate room "unreachable" purely because tile 0,0 is a wall.
 */
const SCREEN_WIDE: ReadonlySet<ScreenAnnotation['kind']> = new Set(['kill-trigger']);

/** Kinds whose state means lock/physical position, not check progress. */
const PHYSICAL: ReadonlySet<ScreenAnnotation['kind']> = new Set([
  'key-door', 'big-key-door', 'cell-lock', 'shutter', 'bombable', 'follower-gate',
  'warp-door', 'exit-door', 'exit',
]);

const reachableNear = (reachable: readonly ReachState[][], row: number, col: number): boolean => {
  for (let r = row - TOUCH; r <= row + TOUCH; r++) {
    const line = reachable[r];
    if (!line) continue;
    for (let c = col - TOUCH; c <= col + TOUCH; c++) {
      if ((line[c] ?? 0) > 0) return true;
    }
  }
  return false;
};

/**
 * Rewrites `state` to 'blocked' for anything the flood cannot touch. Physical
 * kinds keep their open/shut state — a shut door being unreachable is already
 * implied — but checks flip to 'blocked' so the tally and the panel agree.
 */
const markUnreachable = (items: ScreenAnnotation[], reachable?: readonly ReachState[][]): void => {
  if (!reachable) return;
  for (const item of items) {
    if (item.state === 'done' || SCREEN_WIDE.has(item.kind)) continue;
    if (reachableNear(reachable, item.tile.row, item.tile.col)) continue;
    if (PHYSICAL.has(item.kind)) {
      item.detail = item.detail ? `${item.detail} · unreachable` : 'unreachable';
      continue;
    }
    item.state = 'blocked';
  }
};

export { markUnreachable, reachableNear, TOUCH };
