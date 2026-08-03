/* @layer tests @kind test */
/**
 * The Secret Passage case: the uncle blocks the corridor, the flood stops at him,
 * and the chest behind him must NOT read as an available check.
 *
 * The subtlety is that a feature's own tile is usually solid — a chest is a wall
 * tile, a door is the doorway — so reachability has to be judged from the tiles
 * around it, or every annotation would look unreachable.
 */
import { describe, it, expect } from 'vitest';
import type { ScreenAnnotation } from '../../shared/game/simulation';
import { markUnreachable, reachableNear, TOUCH } from '../../apps/web/src/lib/game/flood/annotate/reachability';

/** 20x20 grid, reachable only in the rows above `wall`. */
const gridBlockedBelow = (wall: number): number[][] =>
  Array.from({ length: 20 }, (_, r) => Array.from({ length: 20 }, () => (r < wall ? 1 : 0)));

const at = (kind: ScreenAnnotation['kind'], row: number, col: number, extra: Partial<ScreenAnnotation> = {}): ScreenAnnotation =>
  ({ kind, label: kind, tile: { row, col }, state: 'available', ...extra });

describe('annotation reachability', () => {
  it('counts a solid feature reachable when a neighbour tile is walkable', () => {
    const grid = gridBlockedBelow(10);
    // The tile itself is unreachable (row 10) but row 9 above it is walkable.
    expect(grid[10][5]).toBe(0);
    expect(reachableNear(grid, 10, 5)).toBe(true);
  });

  it('reports unreachable once nothing within reach is walkable', () => {
    const grid = gridBlockedBelow(10);
    expect(reachableNear(grid, 10 + TOUCH + 1, 5)).toBe(false);
  });

  it('flips an out-of-reach chest to blocked instead of available', () => {
    const items = [at('chest', 18, 5)];
    markUnreachable(items, gridBlockedBelow(10));
    expect(items[0].state).toBe('blocked');
  });

  it('leaves a reachable chest available', () => {
    const items = [at('chest', 9, 5)];
    markUnreachable(items, gridBlockedBelow(10));
    expect(items[0].state).toBe('available');
  });

  it('never un-completes a check that is already done', () => {
    const items = [at('chest', 18, 5, { state: 'done' })];
    markUnreachable(items, gridBlockedBelow(10));
    expect(items[0].state).toBe('done');
  });

  it('annotates a physical lock as unreachable without destroying its lock state', () => {
    const items = [at('key-door', 18, 5, { state: 'shut' })];
    markUnreachable(items, gridBlockedBelow(10));
    expect(items[0].state).toBe('shut');
    expect(items[0].detail).toBe('unreachable');
  });

  it('appends to an existing detail rather than replacing it', () => {
    const items = [at('shutter', 18, 5, { state: 'shut', detail: 'closes behind Link' })];
    markUnreachable(items, gridBlockedBelow(10));
    expect(items[0].detail).toBe('closes behind Link · unreachable');
  });

  it('is a no-op with no flood, so a pre-flood panel makes no false claims', () => {
    const items = [at('chest', 18, 5)];
    markUnreachable(items, undefined);
    expect(items[0].state).toBe('available');
  });
});
