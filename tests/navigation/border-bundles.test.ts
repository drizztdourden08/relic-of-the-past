/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { findBorderBundles, computeOverlap, buildWalkConnection } from '../../shared/game/navigation/analysis/border-bundles';
import type { ReachState } from '../../shared/game/navigation/types';

describe('Border Bundles', () => {
  describe('computeOverlap', () => {
    it('returns intersection of two tile arrays', () => {
      expect(computeOverlap([1, 2, 3, 4, 5], [3, 4, 5, 6, 7])).toEqual([3, 4, 5]);
    });

    it('returns empty for no overlap', () => {
      expect(computeOverlap([1, 2, 3], [4, 5, 6])).toEqual([]);
    });

    it('handles empty arrays', () => {
      expect(computeOverlap([], [1, 2, 3])).toEqual([]);
      expect(computeOverlap([1, 2, 3], [])).toEqual([]);
    });
  });

  describe('findBorderBundles (unit)', () => {
    it('splits non-contiguous tiles into separate bundles', () => {
      // Mock a minimal flood fill result
      const mockResult = {
        screenIndex: 0x38,
        reachable: createMockGrid([
          // North border: tiles at cols 5-10 and 20-25 are reachable
          { row: 0, cols: [5, 6, 7, 8, 9, 10, 20, 21, 22, 23, 24, 25] },
        ]),
        reachableCount: 100,
        totalTiles: 4096,
        transitions: [],
        entrances: [],
        ledges: [],
        borders: { north: { freeTiles: [], itemTiles: [] }, south: { freeTiles: [], itemTiles: [] }, east: { freeTiles: [], itemTiles: [] }, west: { freeTiles: [], itemTiles: [] } },
      };

      const bundles = findBorderBundles(mockResult as any);
      const northBundles = bundles.filter(b => b.direction === 'n');

      expect(northBundles.length).toBe(2);
      expect(northBundles[0].tiles).toEqual([5, 6, 7, 8, 9, 10]);
      expect(northBundles[1].tiles).toEqual([20, 21, 22, 23, 24, 25]);
      expect(northBundles[0].id).toBe('lw-38-edge-n-0');
      expect(northBundles[1].id).toBe('lw-38-edge-n-1');
    });

    it('creates single bundle for fully contiguous border', () => {
      const mockResult = {
        screenIndex: 0x31,
        reachable: createMockGrid([
          { row: 0, cols: Array.from({ length: 64 }, (_, i) => i) },
        ]),
        reachableCount: 3915,
        totalTiles: 4096,
        transitions: [],
        entrances: [],
        ledges: [],
        borders: { north: { freeTiles: [], itemTiles: [] }, south: { freeTiles: [], itemTiles: [] }, east: { freeTiles: [], itemTiles: [] }, west: { freeTiles: [], itemTiles: [] } },
      };

      const bundles = findBorderBundles(mockResult as any);
      const northBundles = bundles.filter(b => b.direction === 'n');

      expect(northBundles.length).toBe(1);
      expect(northBundles[0].tiles.length).toBe(64);
    });

    it('creates no bundles for unreachable border', () => {
      const mockResult = {
        screenIndex: 0x29,
        reachable: createMockGrid([]),  // south border row 63 empty
        reachableCount: 1000,
        totalTiles: 4096,
        transitions: [],
        entrances: [],
        ledges: [],
        borders: { north: { freeTiles: [], itemTiles: [] }, south: { freeTiles: [], itemTiles: [] }, east: { freeTiles: [], itemTiles: [] }, west: { freeTiles: [], itemTiles: [] } },
      };

      const bundles = findBorderBundles(mockResult as any);
      const southBundles = bundles.filter(b => b.direction === 's');
      expect(southBundles.length).toBe(0);
    });
  });
});

// Helper: create a 64×64 ReachState grid with specific tiles marked reachable (1)
const createMockGrid = (specs: { row: number; cols: number[] }[]): ReachState[][] => {
  const grid: ReachState[][] = Array.from({ length: 64 }, () => new Array<ReachState>(64).fill(0));
  for (const { row, cols } of specs) {
    for (const col of cols) {
      grid[row][col] = 1;
    }
  }
  return grid;
};
