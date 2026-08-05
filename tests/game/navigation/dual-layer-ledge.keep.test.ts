/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { DualLayerStrategy } from '../../../shared/game/navigation/strategies/dual-layer';
import type { QuadrantBounds, BFSCell } from '../../../shared/game/navigation/strategies/layer-strategy';
import type { TilePassability } from '../../../shared/game/navigation/types';
import { GRID_SIZE } from '../../../shared/game/navigation/types';

// Regression for commit 2de348d9: tagging ledge tiles as traversal accidentally replaced
// expandLedgeCross's landing-cell return with `return []`, so a ledge drop drew the overlay
// arrow but never flooded the layer-1 area it lands in. Any dungeon room reachable ONLY by
// dropping off a ledge (e.g. room 0x72 East Corridor) under-reported reachability ever since.

const fill = (tile: TilePassability): TilePassability[][] =>
  Array.from({ length: GRID_SIZE }, () => new Array<TilePassability>(GRID_SIZE).fill(tile));

const zeros = (): number[][] =>
  Array.from({ length: GRID_SIZE }, () => new Array<number>(GRID_SIZE).fill(0));

const FULL_BOUNDS: QuadrantBounds = { minRow: 0, maxRow: GRID_SIZE - 1, minCol: 0, maxCol: GRID_SIZE - 1 };

describe('DualLayerStrategy — ledge drop enqueues its layer-1 landing', () => {
  it('returns the landing cell on layer 1 when Link drops south off a 2-wide ledge', () => {
    // Layer 0: walkable, with a south-facing ledge band at rows 11-12, cols 20-21.
    const layer0 = fill({ type: 'free' });
    for (const r of [11, 12]) {
      for (const c of [20, 21]) layer0[r][c] = { type: 'ledge', dir: 's' };
    }
    // Layer 1: open floor — the lower area Link falls into.
    const layer1 = fill({ type: 'free' });

    const strategy = new DualLayerStrategy([layer0, layer1], [zeros(), zeros()], true, 0);

    // Body at (10,20) on layer 0 steps south into the ledge and jumps.
    const cell: BFSCell = { row: 10, col: 20, layer: 0, requirements: new Set() };
    const results = strategy.expand(cell, 1, 0, new Set(), FULL_BOUNDS);

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ row: 13, col: 20, layer: 1 });
  });

  // Regression for room 0x72's west walkway: a NORTH jump enters a 1-deep trigger line
  // (the wall extension continues beyond it). The old check required Link's whole 2x2
  // body on ledge tiles at the entry position — which straddles the approach floor, so
  // 1-deep north/east/west fans never fired and the lower floor stayed unflooded.
  it('crosses a 1-deep north trigger line (leading edge fully on ledges)', () => {
    const layer0 = fill({ type: 'free' });
    // Trigger line row 20 + wall extension rows 18-19, cols 20-21, all jumping north.
    for (const r of [18, 19, 20]) {
      for (const c of [20, 21]) layer0[r][c] = { type: 'ledge', dir: 'n' };
    }
    const layer1 = fill({ type: 'free' });
    const strategy = new DualLayerStrategy([layer0, layer1], [zeros(), zeros()], true, 0);

    // Body at (21,20) steps north: leading edge (row 20) is fully on n-ledges.
    const cell: BFSCell = { row: 21, col: 20, layer: 0, requirements: new Set() };
    const results = strategy.expand(cell, -1, 0, new Set(), FULL_BOUNDS);

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ row: 16, col: 20, layer: 1 });
  });

  it('refuses a 1-wide ledge — the 2-wide leading edge cannot fit', () => {
    const layer0 = fill({ type: 'free' });
    // Single-column ledge at col 20, rows 18-20.
    for (const r of [18, 19, 20]) layer0[r][20] = { type: 'ledge', dir: 'n' };
    const layer1 = fill({ type: 'free' });
    const strategy = new DualLayerStrategy([layer0, layer1], [zeros(), zeros()], true, 0);

    // Both possible approach bodies straddle the 1-wide column — no jump either way.
    for (const col of [19, 20]) {
      const cell: BFSCell = { row: 21, col, layer: 0, requirements: new Set() };
      expect(strategy.expand(cell, -1, 0, new Set(), FULL_BOUNDS)).toHaveLength(0);
    }
  });
});
