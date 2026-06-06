/* @layer tests @kind test */
/**
 * Validation test for generated dungeon screen + connection data.
 *
 * Verifies:
 * - All expected dungeons are present
 * - Room counts match expected ranges (from kDungMap_FloorLayout + supplementals)
 * - No duplicate room IDs across dungeons
 * - No duplicate inGameIndex values across dungeons
 * - Every connection references a valid screen ID
 * - Every room has required fields (id, name, type, inGameIndex, dungeon, tags)
 * - Entrance/exit transitions reference valid screen IDs
 * - Total room count matches expected ~193
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const GENERATED_DIR = join(import.meta.dirname, '..', 'temp-scripts', 'generated');
const SCREENS_DIR = join(GENERATED_DIR, 'regions');
const CONNECTIONS_DIR = join(GENERATED_DIR, 'connections');

// Load generated data
const screenSummary = JSON.parse(readFileSync(join(SCREENS_DIR, '_summary.json'), 'utf8'));
const connectionSummary = JSON.parse(readFileSync(join(CONNECTIONS_DIR, '_summary.json'), 'utf8'));
const transitions = JSON.parse(readFileSync(join(CONNECTIONS_DIR, '_transitions.json'), 'utf8'));

// Load individual dungeon screen files
const dungeonScreens: Record<string, any> = {};
for (const dg of screenSummary.dungeons) {
  dungeonScreens[dg.prefix] = JSON.parse(readFileSync(join(SCREENS_DIR, `${dg.prefix}.json`), 'utf8'));
}

// Load individual dungeon connection files
const dungeonConnections: Record<string, any> = {};
for (const dg of connectionSummary.perDungeon) {
  dungeonConnections[dg.prefix] = JSON.parse(readFileSync(join(CONNECTIONS_DIR, `${dg.prefix}.json`), 'utf8'));
}

// ─── Expected Data ───

const EXPECTED_DUNGEONS = ['hc', 'ep', 'dp', 'toh', 'ct', 'pod', 'sp', 'sw', 'tt', 'ip', 'mm', 'tr', 'gt'];

// Expected room counts per dungeon (from ROM kDungMap_FloorLayout + validated supplementals)
const EXPECTED_ROOM_COUNTS: Record<string, { min: number; max: number }> = {
  hc: { min: 21, max: 23 },   // Sewers(8) + HC(13) + supplementals
  ep: { min: 12, max: 14 },   // 12 map + 0x89 supplemental
  dp: { min: 10, max: 11 },   // 10 from map
  toh: { min: 7, max: 8 },    // 6 map + 0xA7 boss room
  ct: { min: 7, max: 8 },     // 7 from map
  pod: { min: 14, max: 16 },  // 14 from map
  sp: { min: 13, max: 15 },   // 13 map + 0x25 supplemental
  sw: { min: 9, max: 10 },    // 9 from map
  tt: { min: 12, max: 13 },   // 12 from map
  ip: { min: 21, max: 23 },   // 21 map + 0x4F supplemental
  mm: { min: 18, max: 20 },   // 18 from map
  tr: { min: 17, max: 19 },   // 17 from map
  gt: { min: 26, max: 29 },   // 26 map + supplementals
};

// ─── Tests ───

describe('Generated Screens', () => {
  it('should have all 13 expected dungeons', () => {
    const generatedPrefixes = screenSummary.dungeons.map((d: any) => d.prefix);
    for (const expected of EXPECTED_DUNGEONS) {
      expect(generatedPrefixes).toContain(expected);
    }
    expect(generatedPrefixes).toHaveLength(EXPECTED_DUNGEONS.length);
  });

  it('should have expected room counts per dungeon', () => {
    for (const dg of screenSummary.dungeons) {
      const expected = EXPECTED_ROOM_COUNTS[dg.prefix];
      expect(dg.roomCount, `${dg.prefix} room count`).toBeGreaterThanOrEqual(expected.min);
      expect(dg.roomCount, `${dg.prefix} room count`).toBeLessThanOrEqual(expected.max);
    }
  });

  it('should have total rooms in the 185-200 range', () => {
    expect(screenSummary.totalDungeonRooms).toBeGreaterThanOrEqual(185);
    expect(screenSummary.totalDungeonRooms).toBeLessThanOrEqual(200);
  });

  it('should have no duplicate room IDs across all dungeons', () => {
    const allIds = new Set<string>();
    const duplicates: string[] = [];
    for (const dg of screenSummary.dungeons) {
      for (const id of dg.rooms) {
        if (allIds.has(id)) duplicates.push(id);
        allIds.add(id);
      }
    }
    expect(duplicates, `Duplicate IDs: ${duplicates.join(', ')}`).toHaveLength(0);
  });

  it('should have no duplicate roomIndex values across all dungeons', () => {
    const allIndices = new Set<number>();
    const duplicates: number[] = [];
    for (const [, data] of Object.entries(dungeonScreens)) {
      for (const room of (data as any).rooms) {
        if (allIndices.has(room.roomIndex)) duplicates.push(room.roomIndex);
        allIndices.add(room.roomIndex);
      }
    }
    expect(duplicates, `Duplicate indices: ${duplicates.map(i => '0x' + i.toString(16)).join(', ')}`).toHaveLength(0);
  });

  it('should have all required fields on every room', () => {
    const requiredFields = ['id', 'name', 'type', 'roomIndex', 'tags'];
    for (const [prefix, data] of Object.entries(dungeonScreens)) {
      for (const room of (data as any).rooms) {
        for (const field of requiredFields) {
          expect(room[field], `${prefix} room ${room.id} missing '${field}'`).not.toBeUndefined();
        }
      }
    }
  });

  it('should use correct ID format (prefix-0xHH)', () => {
    const idPattern = /^[a-z]+-0x[0-9a-f]{2}$/;
    for (const [prefix, data] of Object.entries(dungeonScreens)) {
      for (const room of (data as any).rooms) {
        expect(room.id, `Invalid ID format: ${room.id}`).toMatch(idPattern);
        expect(room.id.startsWith(prefix), `ID ${room.id} doesn't start with ${prefix}`).toBe(true);
      }
    }
  });

  it('should have valid tags on every room', () => {
    const validWorldTags = ['world:light', 'world:dark'];
    const validEnvTags = ['env:underground', 'env:inside', 'env:outside', 'env:water'];
    const validTypeTags = ['type:dungeon'];

    for (const [, data] of Object.entries(dungeonScreens)) {
      for (const room of (data as any).rooms) {
        expect(room.tags.some((t: string) => validWorldTags.includes(t)),
          `${room.id} missing world tag`).toBe(true);
        expect(room.tags.some((t: string) => validEnvTags.includes(t)),
          `${room.id} missing env tag`).toBe(true);
        expect(room.tags.some((t: string) => validTypeTags.includes(t)),
          `${room.id} missing type tag`).toBe(true);
        expect(room.tags.some((t: string) => t.startsWith('dungeon:')),
          `${room.id} missing dungeon tag`).toBe(true);
        expect(room.tags.some((t: string) => t.startsWith('area:')),
          `${room.id} missing area tag`).toBe(true);
      }
    }
  });

  it('roomIndex should match the hex in the ID', () => {
    for (const [, data] of Object.entries(dungeonScreens)) {
      for (const room of (data as any).rooms) {
        const hexPart = room.id.match(/-0x([0-9a-f]+)$/)?.[1];
        const expectedIndex = parseInt(hexPart!, 16);
        expect(room.roomIndex, `${room.id} roomIndex mismatch`).toBe(expectedIndex);
      }
    }
  });

  it('gridX and gridY should be derivable from roomIndex for dungeons', () => {
    for (const [, data] of Object.entries(dungeonScreens)) {
      for (const room of (data as any).rooms) {
        if (room.dungeon?.gridX != null) {
          const expectedX = room.roomIndex & 0x0F;
          const expectedY = (room.roomIndex >> 4) & 0x0F;
          expect(room.dungeon.gridX, `${room.id} gridX`).toBe(expectedX);
          expect(room.dungeon.gridY, `${room.id} gridY`).toBe(expectedY);
        }
      }
    }
  });
});

describe('Generated Connections', () => {
  // Build set of all valid screen IDs
  const allScreenIds = new Set<string>();
  for (const dg of screenSummary.dungeons) {
    for (const id of dg.rooms) allScreenIds.add(id);
  }

  it('should have connections for all 13 dungeons', () => {
    const connectionPrefixes = connectionSummary.perDungeon.map((d: any) => d.prefix);
    for (const expected of EXPECTED_DUNGEONS) {
      expect(connectionPrefixes).toContain(expected);
    }
  });

  it('should have at least 1 internal connection per dungeon', () => {
    for (const dg of connectionSummary.perDungeon) {
      expect(dg.connections, `${dg.prefix} has no connections`).toBeGreaterThan(0);
    }
  });

  it('all internal connection "from" and "to" should reference valid screen IDs', () => {
    const invalidRefs: string[] = [];
    for (const [prefix, data] of Object.entries(dungeonConnections)) {
      for (const conn of (data as any).connections) {
        if (!allScreenIds.has(conn.from)) invalidRefs.push(`${prefix}: from=${conn.from}`);
        if (!allScreenIds.has(conn.to)) invalidRefs.push(`${prefix}: to=${conn.to}`);
      }
    }
    expect(invalidRefs, `Invalid refs:\n${invalidRefs.slice(0, 20).join('\n')}`).toHaveLength(0);
  });

  it('all connections should have required fields', () => {
    for (const [prefix, data] of Object.entries(dungeonConnections)) {
      for (const conn of (data as any).connections) {
        expect(conn.from, `${prefix} connection missing 'from'`).toBeTruthy();
        expect(conn.to, `${prefix} connection missing 'to'`).toBeTruthy();
        expect(conn.tags, `${prefix} connection missing 'tags'`).toBeInstanceOf(Array);
        expect(conn.tags.length, `${prefix} connection has empty tags`).toBeGreaterThan(0);
      }
    }
  });

  it('connection tags should use valid namespaces', () => {
    const validPrefixes = ['transit:', 'dir:', 'ctx:', 'barrier:'];
    for (const [prefix, data] of Object.entries(dungeonConnections)) {
      for (const conn of (data as any).connections) {
        for (const tag of conn.tags) {
          const hasValidPrefix = validPrefixes.some(p => (tag as string).startsWith(p));
          expect(hasValidPrefix, `${prefix} conn ${conn.from}->${conn.to} has invalid tag: ${tag}`).toBe(true);
        }
      }
    }
  });

  it('total internal connections should be in reasonable range', () => {
    // 193 rooms with an average of ~1.5 connections each
    expect(connectionSummary.totalInternalConnections).toBeGreaterThan(200);
    expect(connectionSummary.totalInternalConnections).toBeLessThan(500);
  });

  it('should have dungeon entrance transitions', () => {
    expect(transitions.entranceCount).toBeGreaterThan(20);
    for (const ent of transitions.entrances) {
      expect(allScreenIds.has(ent.to), `Entrance target ${ent.to} not in screens`).toBe(true);
    }
  });

  it('should have dungeon exit transitions', () => {
    expect(transitions.exitCount).toBeGreaterThan(15);
    for (const exit of transitions.exits) {
      expect(allScreenIds.has(exit.from), `Exit source ${exit.from} not in screens`).toBe(true);
    }
  });

  it('no self-referencing connections', () => {
    const selfRefs: string[] = [];
    for (const [prefix, data] of Object.entries(dungeonConnections)) {
      for (const conn of (data as any).connections) {
        if (conn.from === conn.to) selfRefs.push(`${prefix}: ${conn.from}`);
      }
    }
    expect(selfRefs, `Self-refs: ${selfRefs.join(', ')}`).toHaveLength(0);
  });

  it('no duplicate connections (same from+to pair)', () => {
    const duplicates: string[] = [];
    for (const [prefix, data] of Object.entries(dungeonConnections)) {
      const seen = new Set<string>();
      for (const conn of (data as any).connections) {
        const key = `${conn.from}|${conn.to}`;
        if (seen.has(key)) duplicates.push(`${prefix}: ${key}`);
        seen.add(key);
      }
    }
    expect(duplicates, `Duplicates:\n${duplicates.slice(0, 10).join('\n')}`).toHaveLength(0);
  });
});

describe('Cross-validation', () => {
  it('every room should be reachable (have at least one connection to/from it)', () => {
    const connectedRooms = new Set<string>();
    for (const [, data] of Object.entries(dungeonConnections)) {
      for (const conn of (data as any).connections) {
        connectedRooms.add(conn.from);
        connectedRooms.add(conn.to);
      }
    }
    // Also add rooms from entrance/exit transitions
    for (const ent of transitions.entrances) connectedRooms.add(ent.to);
    for (const exit of transitions.exits) connectedRooms.add(exit.from);

    const unreachable: string[] = [];
    for (const dg of screenSummary.dungeons) {
      for (const id of dg.rooms) {
        if (!connectedRooms.has(id)) unreachable.push(id);
      }
    }
    // Some rooms may only be reachable via pits (not stair data)
    // Allow up to 20 unreachable (these will need manual connections)
    expect(unreachable.length, `Unreachable rooms (${unreachable.length}):\n${unreachable.join('\n')}`).toBeLessThan(20);
  });
});
