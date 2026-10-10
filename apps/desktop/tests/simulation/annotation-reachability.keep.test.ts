/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import type { ScreenAnnotation } from '@rotp/navigation';
import { markUnreachable, reachableNear, TOUCH } from '@rotp/navigation';
import { required } from '../required';

const gridBlockedBelow = (wall: number): number[][] =>
  Array.from({ length: 20 }, (_, r) => Array.from({ length: 20 }, () => (r < wall ? 1 : 0)));

const at = (kind: ScreenAnnotation['kind'], row: number, col: number, extra: Partial<ScreenAnnotation> = {}): ScreenAnnotation =>
  ({ kind, label: kind, tile: { row, col }, state: 'available', ...extra });

describe('annotation reachability', () => {
  it('counts a solid feature reachable when a neighbour tile is walkable', () => {
    const grid = gridBlockedBelow(10);
    expect(required(grid[10], 'grid row 10')[5]).toBe(0);
    expect(reachableNear(grid, 10, 5)).toBe(true);
  });

  it('reports unreachable once nothing within reach is walkable', () => {
    const grid = gridBlockedBelow(10);
    expect(reachableNear(grid, 10 + TOUCH + 1, 5)).toBe(false);
  });

  it('flips an out-of-reach chest to blocked instead of available', () => {
    const item = at('chest', 18, 5);
    markUnreachable([item], gridBlockedBelow(10));
    expect(item.state).toBe('blocked');
  });

  it('leaves a reachable chest available', () => {
    const item = at('chest', 9, 5);
    markUnreachable([item], gridBlockedBelow(10));
    expect(item.state).toBe('available');
  });

  it('never un-completes a check that is already done', () => {
    const item = at('chest', 18, 5, { state: 'done' });
    markUnreachable([item], gridBlockedBelow(10));
    expect(item.state).toBe('done');
  });

  it('annotates a physical lock as unreachable without destroying its lock state', () => {
    const item = at('key-door', 18, 5, { state: 'shut' });
    markUnreachable([item], gridBlockedBelow(10));
    expect(item.state).toBe('shut');
    expect(item.detail).toBe('unreachable');
  });

  it('appends to an existing detail instead of replacing it', () => {
    const item = at('shutter', 18, 5, { state: 'shut', detail: 'closes behind Link' });
    markUnreachable([item], gridBlockedBelow(10));
    expect(item.detail).toBe('closes behind Link · unreachable');
  });

  it('is a no-op with no flood, so a pre-flood panel makes no false claims', () => {
    const item = at('chest', 18, 5);
    markUnreachable([item], undefined);
    expect(item.state).toBe('available');
  });
});
