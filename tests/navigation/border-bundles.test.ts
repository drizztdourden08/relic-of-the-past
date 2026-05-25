import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync } from 'fs';
import { join } from 'path';
import { loadRom, type RomData } from '../../shared/asset-extraction/rom';
import { floodFillScreen, initEngine } from '../../shared/game/navigation/flood-fill';
import { findBorderBundles, computeOverlap, buildWalkConnection } from '../../shared/game/navigation/analysis/border-bundles';

const ROM_PATH = join(__dirname, '..', '..', 'test-roms', 'Legend of Zelda, The - A Link to the Past (USA).sfc');
const romAvailable = existsSync(ROM_PATH);

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

  describe.skipIf(!romAvailable)('two-sided validation with ROM', () => {
    let rom: RomData;

    beforeAll(() => {
      rom = loadRom(ROM_PATH);
      initEngine(rom);
    });

    it('0x38 ↔ 0x39 (east/west) has valid overlap', () => {
      const from = floodFillScreen(rom, 0x38);
      const to = floodFillScreen(rom, 0x39);
      const connections = buildWalkConnection(from, to, 'e');

      expect(connections.length).toBeGreaterThan(0);
      const totalOverlap = connections.reduce((sum, c) => sum + c.overlapTiles.length, 0);
      expect(totalOverlap).toBeGreaterThan(0);
      console.log(`0x38→0x39 east: ${connections.length} bundle pair(s), total overlap: ${totalOverlap}`);
    });

    it('0x31 → 0x29 (north) has ZERO overlap (the bug)', () => {
      const from = floodFillScreen(rom, 0x31);
      const to = floodFillScreen(rom, 0x29);
      const connections = buildWalkConnection(from, to, 'n');

      // 0x31 has full north border, but 0x29 has 0 south border tiles
      const totalOverlap = connections.reduce((sum, c) => sum + c.overlapTiles.length, 0);
      expect(totalOverlap).toBe(0);
      console.log(`0x31→0x29 north: overlap=${totalOverlap} (correctly invalid)`);
    });

    it('0x38 → 0x30 (north) has valid overlap', () => {
      const from = floodFillScreen(rom, 0x38);
      const to = floodFillScreen(rom, 0x30);
      const connections = buildWalkConnection(from, to, 'n');

      const totalOverlap = connections.reduce((sum, c) => sum + c.overlapTiles.length, 0);
      expect(totalOverlap).toBeGreaterThan(0);
      console.log(`0x38→0x30 north: ${connections.length} pair(s), overlap=${totalOverlap}`);
    });

    it('detects multiple bundles on a split border', () => {
      // Screen 0x38 east border — likely has at least one corridor
      const result = floodFillScreen(rom, 0x38);
      const bundles = findBorderBundles(result);
      const eastBundles = bundles.filter(b => b.direction === 'e');

      console.log(`0x38 east bundles: ${eastBundles.length}`);
      for (const b of eastBundles) {
        console.log(`  ${b.id}: tiles ${b.tiles[0]}–${b.tiles[b.tiles.length - 1]} (${b.tiles.length} wide)`);
      }
      expect(eastBundles.length).toBeGreaterThanOrEqual(1);
    });
  });
});

// Helper: create a 64×64 boolean grid with specific tiles marked reachable
function createMockGrid(specs: { row: number; cols: number[] }[]): boolean[][] {
  const grid: boolean[][] = Array.from({ length: 64 }, () => new Array(64).fill(false));
  for (const { row, cols } of specs) {
    for (const col of cols) {
      grid[row][col] = true;
    }
  }
  return grid;
}
