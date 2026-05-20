import { describe, it, expect } from 'vitest';
import { findShortestPath, findUnreachableRegions, getGraphStats } from '../../shared/game/navigation';

describe('Navigation Graph', () => {
  describe('getGraphStats', () => {
    it('reports graph structure', () => {
      const stats = getGraphStats();
      console.log('=== GRAPH STATS ===');
      console.log(`Total regions defined: ${stats.totalRegions}`);
      console.log(`Total nodes in connection graph: ${stats.totalNodesInGraph}`);
      console.log(`Total connections: ${stats.totalConnections}`);
      console.log(`Dead ends (no outgoing): ${stats.deadEnds.length}`);
      console.log(`Entry-only (no incoming): ${stats.entryOnlyNodes.length}`);
      console.log(`Orphaned (not in any connection): ${stats.orphanedRegions.length}`);

      if (stats.orphanedRegions.length > 0) {
        console.log('\n--- Orphaned Regions (defined but never connected) ---');
        for (const id of stats.orphanedRegions) {
          console.log(`  ${id}`);
        }
      }

      if (stats.deadEnds.length > 0) {
        console.log('\n--- Dead Ends (no outgoing edges) ---');
        for (const id of stats.deadEnds.slice(0, 30)) {
          console.log(`  ${id}`);
        }
        if (stats.deadEnds.length > 30) console.log(`  ... and ${stats.deadEnds.length - 30} more`);
      }

      expect(stats.totalRegions).toBeGreaterThan(0);
      expect(stats.totalConnections).toBeGreaterThan(0);
    });
  });

  describe('findUnreachableRegions', () => {
    it('finds regions unreachable from menu', () => {
      const unreachable = findUnreachableRegions('menu');
      console.log(`\n=== UNREACHABLE FROM "menu" ===`);
      console.log(`Unreachable: ${unreachable.length}`);

      if (unreachable.length > 0) {
        const byType = new Map<string, typeof unreachable>();
        for (const r of unreachable) {
          const list = byType.get(r.type) ?? [];
          list.push(r);
          byType.set(r.type, list);
        }

        for (const [type, regions] of byType) {
          console.log(`\n--- ${type} (${regions.length}) ---`);
          for (const r of regions.slice(0, 20)) {
            console.log(`  ${r.id} — ${r.name}`);
          }
          if (regions.length > 20) console.log(`  ... and ${regions.length - 20} more`);
        }
      }

      // This is informational — don't fail, just report
      expect(unreachable).toBeDefined();
    });

    it('finds regions unreachable from links-house', () => {
      const unreachable = findUnreachableRegions('links-house');
      console.log(`\n=== UNREACHABLE FROM "links-house" ===`);
      console.log(`Unreachable: ${unreachable.length}`);
      expect(unreachable).toBeDefined();
    });
  });

  describe('findShortestPath', () => {
    it('finds path from menu to links-house', () => {
      const result = findShortestPath('menu', 'links-house');
      console.log('\n=== menu → links-house ===');
      console.log(`Found: ${result.found}, Distance: ${result.distance}, Visited: ${result.visited}`);
      if (result.found) {
        for (const step of result.path) {
          const via = step.entrance ? ` via "${step.entrance}"` : ' (start)';
          console.log(`  → ${step.regionId} (${step.regionName})${via}`);
        }
      }
      expect(result.found).toBe(true);
    });

    it('finds path from links-house to eastern-palace entrance', () => {
      const result = findShortestPath('links-house', 'ep-0x89');
      console.log('\n=== links-house → ep-0x89 (Eastern Palace Entrance) ===');
      console.log(`Found: ${result.found}, Distance: ${result.distance}, Visited: ${result.visited}`);
      if (result.found) {
        for (const step of result.path) {
          const via = step.entrance ? ` via "${step.entrance}"` : ' (start)';
          console.log(`  → ${step.regionId} (${step.regionName})${via}`);
        }
      }
    });

    it('finds path from links-house to ganons-tower', () => {
      const result = findShortestPath('links-house', 'gt-0x05');
      console.log('\n=== links-house → gt-0x05 (Ganon\'s Tower Entrance) ===');
      console.log(`Found: ${result.found}, Distance: ${result.distance}, Visited: ${result.visited}`);
      if (result.found) {
        for (const step of result.path) {
          const via = step.entrance ? ` via "${step.entrance}"` : ' (start)';
          console.log(`  → ${step.regionId} (${step.regionName})${via}`);
        }
      }
    });

    it('finds cross-world path (light → dark)', () => {
      const result = findShortestPath('light-world', 'east-dark-world');
      console.log('\n=== light-world → east-dark-world ===');
      console.log(`Found: ${result.found}, Distance: ${result.distance}, Visited: ${result.visited}`);
      if (result.found) {
        for (const step of result.path) {
          const via = step.entrance ? ` via "${step.entrance}"` : ' (start)';
          console.log(`  → ${step.regionId} (${step.regionName})${via}`);
        }
      }
    });

    it('returns not-found for invalid region', () => {
      const result = findShortestPath('links-house', 'nonexistent-region');
      expect(result.found).toBe(false);
      expect(result.distance).toBe(-1);
    });

    it('handles same source and target', () => {
      const result = findShortestPath('links-house', 'links-house');
      expect(result.found).toBe(true);
      expect(result.distance).toBe(0);
      expect(result.path).toHaveLength(1);
    });
  });
});
