/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { DualLayerStrategy } from '../../../shared/game/navigation/strategies/dual-layer';
import type { QuadrantBounds, BFSCell } from '../../../shared/game/navigation/strategies/layer-strategy';
import type { TilePassability } from '../../../shared/game/navigation/types';
import { GRID_SIZE } from '../../../shared/game/navigation/types';

const fill = (tile: TilePassability): TilePassability[][] =>
  Array.from({ length: GRID_SIZE }, () => new Array<TilePassability>(GRID_SIZE).fill(tile));

const zeros = (): number[][] =>
  Array.from({ length: GRID_SIZE }, () => new Array<number>(GRID_SIZE).fill(0));

const FULL_BOUNDS: QuadrantBounds = { minRow: 0, maxRow: GRID_SIZE - 1, minCol: 0, maxCol: GRID_SIZE - 1 };

describe('DualLayerStrategy enqueues the layer-1 landing of a ledge drop', () => {
  it('returns the landing cell on layer 1 when Link drops south off a 2-wide ledge', () => {
    const upperLayer = fill({ type: 'free' });
    for (const r of [11, 12]) {
      for (const c of [20, 21]) upperLayer[r][c] = { type: 'ledge', dir: 's' };
    }
    const lowerLayer = fill({ type: 'free' });

    const strategy = new DualLayerStrategy([upperLayer, lowerLayer], [zeros(), zeros()], true, 0);

    const bodyAboveLedge: BFSCell = { row: 10, col: 20, layer: 0, requirements: new Set() };
    const results = strategy.expand(bodyAboveLedge, 1, 0, new Set(), FULL_BOUNDS);

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ row: 13, col: 20, layer: 1 });
  });

  it('crosses a 1-deep north trigger line (leading edge fully on ledges)', () => {
    const upperLayer = fill({ type: 'free' });
    for (const r of [18, 19, 20]) {
      for (const c of [20, 21]) upperLayer[r][c] = { type: 'ledge', dir: 'n' };
    }
    const lowerLayer = fill({ type: 'free' });
    const strategy = new DualLayerStrategy([upperLayer, lowerLayer], [zeros(), zeros()], true, 0);

    const bodyBelowTrigger: BFSCell = { row: 21, col: 20, layer: 0, requirements: new Set() };
    const results = strategy.expand(bodyBelowTrigger, -1, 0, new Set(), FULL_BOUNDS);

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ row: 16, col: 20, layer: 1 });
  });

  it('refuses a 1-wide ledge, because the 2-wide leading edge cannot fit', () => {
    const upperLayer = fill({ type: 'free' });
    for (const r of [18, 19, 20]) upperLayer[r][20] = { type: 'ledge', dir: 'n' };
    const lowerLayer = fill({ type: 'free' });
    const strategy = new DualLayerStrategy([upperLayer, lowerLayer], [zeros(), zeros()], true, 0);

    for (const col of [19, 20]) {
      const cell: BFSCell = { row: 21, col, layer: 0, requirements: new Set() };
      expect(strategy.expand(cell, -1, 0, new Set(), FULL_BOUNDS)).toHaveLength(0);
    }
  });
});
