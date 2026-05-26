import { describe, it, expect } from 'vitest';
import { getOverlayPatches } from '../../shared/game/navigation/screen-data/event-overlays';

describe('Event Overlays', () => {
  describe('getOverlayPatches', () => {
    it('returns empty for unknown screen with no variant', () => {
      expect(getOverlayPatches(127)).toEqual([]);
    });

    it('returns unconditional patches for screen 0x33 without variant', () => {
      const patches = getOverlayPatches(0x33);
      expect(patches).toHaveLength(1);
      expect(patches[0]).toEqual({ col: 20, row: 5, tile: 0x20f });
    });

    it('returns unconditional patches for screen 0x2F without variant', () => {
      const patches = getOverlayPatches(0x2F);
      expect(patches).toHaveLength(1);
      expect(patches[0]).toEqual({ col: 25, row: 23, tile: 0x20f });
    });

    it('returns event overlay patches when bit 0x20 is set', () => {
      const patches = getOverlayPatches(3, { eventFlags: 0x20 });
      expect(patches.some(p => p.tile === 0x212)).toBe(true);
    });

    it('does NOT return event overlay patches when bit 0x20 is clear', () => {
      const patches = getOverlayPatches(3, { eventFlags: 0x00 });
      expect(patches).toHaveLength(0);
    });

    it('returns 2x2 rock removal patch (0x918-0x91b) for screens 8-19', () => {
      const patches = getOverlayPatches(10, { eventFlags: 0x20 });
      const rockPatches = patches.filter(p => p.tile >= 0x918 && p.tile <= 0x91b);
      expect(rockPatches).toHaveLength(4);
      expect(rockPatches).toContainEqual({ col: 3, row: 10, tile: 0x918 });
      expect(rockPatches).toContainEqual({ col: 4, row: 10, tile: 0x919 });
      expect(rockPatches).toContainEqual({ col: 3, row: 11, tile: 0x91a });
      expect(rockPatches).toContainEqual({ col: 4, row: 11, tile: 0x91b });
    });

    it('returns bomb door patches when bit 0x02 is set', () => {
      const patches = getOverlayPatches(52, { eventFlags: 0x02 });
      const bombPatches = patches.filter(p => p.tile === 0xdb4 || p.tile === 0xdb5);
      expect(bombPatches.length).toBeGreaterThan(0);
    });

    it('does NOT return bomb door patches when bit 0x02 is clear', () => {
      const patches = getOverlayPatches(52, { eventFlags: 0x20 });
      const bombPatches = patches.filter(p => p.tile === 0xdb4 || p.tile === 0xdb5);
      expect(bombPatches).toHaveLength(0);
    });

    it('combines unconditional + event + bomb door patches', () => {
      // Screen 0x33 = 51 decimal has unconditional patches AND may have event + bomb
      const patches = getOverlayPatches(0x33, { eventFlags: 0x22 });
      // Should have at least the unconditional patch
      expect(patches.some(p => p.tile === 0x20f)).toBe(true);
    });

    it('filters out-of-bounds patches (col >= 32)', () => {
      // Screen 74 has patches at col 31 and 32; col 32 should be filtered
      const patches = getOverlayPatches(74, { eventFlags: 0x20 });
      for (const p of patches) {
        expect(p.col).toBeLessThan(32);
        expect(p.row).toBeLessThan(32);
      }
    });

    it('Skull Woods screen 59 returns many tree patches', () => {
      const patches = getOverlayPatches(59, { eventFlags: 0x20 });
      expect(patches.length).toBeGreaterThan(50);
      // All should be within bounds
      for (const p of patches) {
        expect(p.col).toBeLessThan(32);
        expect(p.row).toBeLessThan(32);
      }
    });
  });
});
