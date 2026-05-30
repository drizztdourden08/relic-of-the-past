/**
 * Code generation for RegionDefinition and RegionConnection objects.
 * Serializes data objects into formatted TypeScript source text
 * suitable for insertion into the region/connection data files.
 */

import type { RegionTag } from './regions/tags';
import type { ConnectionTag } from './connections/tags';

interface RegionCodegenInput {
  id: string;
  name: string;
  type: string;
  indoor: boolean;
  darkWorld?: boolean;
  /** Room/screen index */
  roomIndex?: number;
  /** Palace index (dungeon context) */
  palaceIndex?: number;
  /** Structural parent location */
  location?: string;
  dungeon?: string;
  /** @deprecated Use location */
  displayName?: string;
  subtitle?: string;
  gridX?: number;
  gridY?: number;
  floor?: number;
  big?: boolean;
  tags: readonly RegionTag[];
  checks?: readonly string[];
  /** @deprecated Use roomIndex */
  inGameIndex?: number;
}

interface ConnectionCodegenInput {
  from: string;
  to: string;
  tags: readonly ConnectionTag[];
}

/** Format a number as hex (e.g., 0x51) */
function hex(n: number): string {
  return `0x${n.toString(16).padStart(n > 0xff ? 4 : 2, '0').toUpperCase()}`;
}

/** Serialize a RegionDefinition to TS object literal source text */
function serializeRegion(region: RegionCodegenInput, indent = '  '): string {
  const lines: string[] = [];
  lines.push(`${indent}{`);
  lines.push(`${indent}  id: '${region.id}',`);
  lines.push(`${indent}  name: '${escapeSingleQuote(region.name)}',`);
  lines.push(`${indent}  type: '${region.type}', indoor: ${region.indoor},`);
  if (region.inGameIndex != null) {
    lines.push(`${indent}  inGameIndex: ${hex(region.inGameIndex)},`);
  }
  if (region.dungeon) {
    lines.push(`${indent}  dungeon: '${escapeSingleQuote(region.dungeon)}',`);
  }
  lines.push(`${indent}  displayName: '${escapeSingleQuote(region.displayName)}',`);
  if (region.subtitle) {
    lines.push(`${indent}  subtitle: '${escapeSingleQuote(region.subtitle)}',`);
  }
  if (region.gridX != null || region.gridY != null) {
    const parts: string[] = [];
    if (region.gridX != null) parts.push(`gridX: ${region.gridX}`);
    if (region.gridY != null) parts.push(`gridY: ${region.gridY}`);
    lines.push(`${indent}  ${parts.join(', ')},`);
  }
  if (region.floor != null) {
    lines.push(`${indent}  floor: ${region.floor},`);
  }
  if (region.big) {
    lines.push(`${indent}  big: true,`);
  }
  lines.push(`${indent}  tags: [${region.tags.map(t => `'${t}'`).join(', ')}],`);
  if (region.checks && region.checks.length > 0) {
    lines.push(`${indent}  checks: [${region.checks.map(c => `'${escapeSingleQuote(c)}'`).join(', ')}],`);
  }
  lines.push(`${indent}},`);
  return lines.join('\n');
}

/** Serialize a RegionConnection to TS object literal source text */
function serializeConnection(conn: ConnectionCodegenInput, indent = '  '): string {
  const tagStr = conn.tags.map(t => `'${t}'`).join(', ');
  return `${indent}{ from: '${conn.from}', to: '${conn.to}', tags: [${tagStr}] },`;
}

function escapeSingleQuote(s: string): string {
  return s.replace(/'/g, "\\'");
}

// ─── File Path Resolution ───

interface FileTarget {
  /** Path relative to shared/game/data/ */
  relativePath: string;
  /** Array variable name to insert into */
  arrayName: string;
}

const DUNGEON_FILE_MAP: Record<string, string> = {
  'Hyrule Castle': 'hyrule-castle',
  'Castle Tower': 'castle-tower',
  'Eastern Palace': 'eastern-palace',
  'Desert Palace': 'desert-palace',
  'Tower of Hera': 'tower-of-hera',
  'Palace of Darkness': 'palace-of-darkness',
  'Swamp Palace': 'swamp-palace',
  'Skull Woods': 'skull-woods',
  "Thieves' Town": 'thieves-town',
  'Ice Palace': 'ice-palace',
  'Misery Mire': 'misery-mire',
  'Turtle Rock': 'turtle-rock',
  "Ganon's Tower": 'ganons-tower',
};

/** Resolve which source file a region belongs in */
function resolveRegionFile(region: { type: string; dungeon?: string; tags: readonly string[] }): FileTarget {
  const world = region.tags.includes('world:dark') ? 'dark-world' : 'light-world';

  if (region.type === 'dungeon' && region.dungeon) {
    const slug = DUNGEON_FILE_MAP[region.dungeon] ?? region.dungeon.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return {
      relativePath: `regions/${world}/dungeons/${slug}.ts`,
      arrayName: '', // detected from file content
    };
  }

  // Cave/house/shop/etc — determine from location type tag
  const typeTag = region.tags.find(t => t.startsWith('type:'));
  const locType = typeTag?.split(':')[1] ?? 'cave';

  const fileMap: Record<string, string> = {
    cave: 'caves', house: 'houses', shop: 'shops', fairy: 'fairy',
    well: 'wells', hint: 'hints', gamble: 'gamble', passage: 'passages',
    special: 'special',
  };
  const fileName = fileMap[locType] ?? 'caves';
  return {
    relativePath: `regions/${world}/${fileName}.ts`,
    arrayName: '',
  };
}

/** Resolve which source file a connection belongs in */
function resolveConnectionFile(conn: { from: string; to: string; tags: readonly string[] }, regionType?: string, dungeon?: string, world?: 'light' | 'dark'): FileTarget {
  const w = world === 'dark' ? 'dark-world' : 'light-world';

  if (regionType === 'dungeon' && dungeon) {
    const slug = DUNGEON_FILE_MAP[dungeon] ?? dungeon.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return {
      relativePath: `connections/${w}/dungeons/${slug}.ts`,
      arrayName: '',
    };
  }

  // Determine from context tags
  const hasDungeonEnter = conn.tags.includes('ctx:dungeon-enter');
  if (hasDungeonEnter && dungeon) {
    const slug = DUNGEON_FILE_MAP[dungeon] ?? dungeon.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return {
      relativePath: `connections/${w}/dungeons/${slug}.ts`,
      arrayName: '',
    };
  }

  // Default to caves
  return {
    relativePath: `connections/${w}/caves.ts`,
    arrayName: '',
  };
}

export {
  serializeRegion,
  serializeConnection,
  resolveRegionFile,
  resolveConnectionFile,
  hex,
  DUNGEON_FILE_MAP,
};
export type { RegionCodegenInput, ConnectionCodegenInput, FileTarget };
