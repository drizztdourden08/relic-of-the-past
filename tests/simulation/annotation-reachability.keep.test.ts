/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import type { ScreenAnnotation } from '../../shared/game/simulation';
import { markUnreachable, reachableNear, TOUCH } from '../../apps/web/src/lib/game/flood/annotate/reachability';

const gridBlockedBelow = (wall: number): number[][] =>
  Array.from({ length: 20 }, (_, r) => Array.from({ length: 20 }, () => (r < wall ? 1 : 0)));

const at = (kind: ScreenAnnotation['kind'], row: number, col: number, extra: Partial<ScreenAnnotation> = {}): ScreenAnnotation =>
  ({ kind, label: kind, tile: { row, col }, state: 'available', ...extra });

describe('annotation reachability', () => {
  it('counts a solid feature reachable when a neighbour tile is walkable', () => {
    const grid = gridBlockedBelow(10);
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

  it('appends to an existing detail instead of replacing it', () => {
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
