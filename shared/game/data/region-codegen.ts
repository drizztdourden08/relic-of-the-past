/**
 * Code generation for ScreenDefinition and ScreenConnection objects.
 * Serializes data objects into formatted TypeScript source text
 * suitable for insertion into the region/connection data files.
 */

import type { RegionTag } from './regions/tags';
import type { ConnectionTag } from './connections/tags';

interface ScreenCodegenInput {
  id: string;
  name: string;
  type: 'overworld' | 'dungeon' | 'interior';
  world: 'light' | 'dark';
  location: string;
  area: string;
  roomIndex?: number;
  entranceId?: number;
  /** Overworld context */
  overworld?: { gridX: number; gridY: number; bundle?: string };
  /** Dungeon context */
  dungeon?: { name: string; palaceIndex?: number; floor?: number; gridX?: number; gridY?: number };
  /** Interior context */
  interior?: { kind: string };
  tags: readonly RegionTag[];
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

/** Serialize a ScreenDefinition to TS object literal source text */
function serializeScreen(screen: ScreenCodegenInput, indent = '  '): string {
  const lines: string[] = [];
  lines.push(`${indent}{`);
  lines.push(`${indent}  id: '${escapeSingleQuote(screen.id)}',`);
  lines.push(`${indent}  name: '${escapeSingleQuote(screen.name)}',`);
  lines.push(`${indent}  type: '${screen.type}', world: '${screen.world}',`);
  lines.push(`${indent}  location: '${escapeSingleQuote(screen.location)}', area: '${escapeSingleQuote(screen.area)}',`);
  if (screen.roomIndex != null) {
    lines.push(`${indent}  roomIndex: ${hex(screen.roomIndex)},`);
  }
  if (screen.entranceId != null) {
    lines.push(`${indent}  entranceId: ${hex(screen.entranceId)},`);
  }
  // Type-specific context
  if (screen.type === 'overworld' && screen.overworld) {
    const parts = [`gridX: ${screen.overworld.gridX}`, `gridY: ${screen.overworld.gridY}`];
    if (screen.overworld.bundle) parts.push(`bundle: '${escapeSingleQuote(screen.overworld.bundle)}'`);
    lines.push(`${indent}  overworld: { ${parts.join(', ')} },`);
  } else if (screen.type === 'dungeon' && screen.dungeon) {
    const parts = [`name: '${escapeSingleQuote(screen.dungeon.name)}'`];
    if (screen.dungeon.palaceIndex != null) parts.push(`palaceIndex: ${hex(screen.dungeon.palaceIndex)}`);
    if (screen.dungeon.floor != null) parts.push(`floor: ${screen.dungeon.floor}`);
    if (screen.dungeon.gridX != null) parts.push(`gridX: ${screen.dungeon.gridX}`);
    if (screen.dungeon.gridY != null) parts.push(`gridY: ${screen.dungeon.gridY}`);
    lines.push(`${indent}  dungeon: { ${parts.join(', ')} },`);
  } else if (screen.type === 'interior' && screen.interior) {
    lines.push(`${indent}  interior: { kind: '${screen.interior.kind}' },`);
  }
  lines.push(`${indent}  tags: [${screen.tags.map(t => `'${t}'`).join(', ')}],`);
  lines.push(`${indent}},`);
  return lines.join('\n');
}

/** Serialize a ScreenConnection to TS object literal source text */
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

/** Resolve which source file a screen belongs in */
function resolveScreenFile(screen: { type: string; dungeon?: { name: string }; world: string; tags: readonly string[] }): FileTarget {
  const world = screen.world === 'dark' ? 'dark-world' : 'light-world';

  if (screen.type === 'dungeon' && screen.dungeon) {
    const slug = DUNGEON_FILE_MAP[screen.dungeon.name] ?? screen.dungeon.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return {
      relativePath: `regions/${world}/dungeons/${slug}.ts`,
      arrayName: '',
    };
  }

  // Interior — determine from location type tag
  const typeTag = screen.tags.find(t => t.startsWith('type:'));
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
function resolveConnectionFile(conn: { from: string; to: string; tags: readonly string[] }, screenType?: string, dungeon?: string, world?: 'light' | 'dark'): FileTarget {
  const w = world === 'dark' ? 'dark-world' : 'light-world';

  if (screenType === 'dungeon' && dungeon) {
    const slug = DUNGEON_FILE_MAP[dungeon] ?? dungeon.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return {
      relativePath: `connections/${w}/dungeons/${slug}.ts`,
      arrayName: '',
    };
  }

  const hasDungeonEnter = conn.tags.includes('ctx:dungeon-enter');
  if (hasDungeonEnter && dungeon) {
    const slug = DUNGEON_FILE_MAP[dungeon] ?? dungeon.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return {
      relativePath: `connections/${w}/dungeons/${slug}.ts`,
      arrayName: '',
    };
  }

  return {
    relativePath: `connections/${w}/caves.ts`,
    arrayName: '',
  };
}

export {
  serializeScreen,
  serializeConnection,
  resolveScreenFile,
  resolveConnectionFile,
  hex,
  DUNGEON_FILE_MAP,
};
export type { ScreenCodegenInput, ConnectionCodegenInput, FileTarget };
