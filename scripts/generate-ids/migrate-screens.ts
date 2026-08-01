/**
 * @layer tooling-scripts
 * @kind logic
 *
 * Phase 5 one-time transform: migrate ALL_SCREENS + ALL_CONNECTIONS + AREAS +
 * LOCATIONS into ScreenRecord/ConnectionRecord/AreaRecord/LocationRecord,
 * following the id-manifest from generate-ids.ts. Emits four seed TS files.
 *
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS","moduleResolution":"node","types":["node"]}' scripts/generate-ids/migrate-screens.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import { ALL_SCREENS } from '../../shared/game/data/screens/index';
import { ALL_CONNECTIONS } from '../../shared/game/data/connections/index';
import { AREAS } from '../../shared/game/data/screens/areas';
import { LOCATIONS } from '../../shared/game/data/screens/locations';

const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'output/id-manifest.json'), 'utf8'));
const screenIdOf = (oldId: string): string => manifest.screens[oldId];
const areaIdOf = (name: string): string => manifest.areas[AREAS.find((a: { name: string }) => a.name === name)?.id ?? ''];
const locationIdOf = (name: string): string => manifest.locations[LOCATIONS.find((l: { name: string }) => l.name === name)?.id ?? ''];

const toLiteral = (v: unknown): string => {
  if (v === undefined) return 'undefined';
  if (typeof v === 'string') return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(toLiteral).join(', ')}]`;
  if (typeof v === 'object' && v !== null) {
    const entries = Object.entries(v).filter(([, val]) => val !== undefined);
    return `{ ${entries.map(([k, val]) => `${k}: ${toLiteral(val)}`).join(', ')} }`;
  }
  return String(v);
};

const write = (relPath: string, header: string, typeName: string, exportName: string, records: unknown[]): void => {
  const body = records.map(r => `  ${toLiteral(r)} as unknown as ${typeName},`).join('\n');
  const source = `/* @layer shared-game @kind data */\n${header}\nimport type { ${typeName} } from './types';\n\nconst ${exportName}: ${typeName}[] = [\n${body}\n];\n\nexport { ${exportName} };\n`;
  fs.writeFileSync(path.join(__dirname, '../../shared/game/data', relPath), source);
  console.log(`Wrote ${records.length} records to shared/game/data/${relPath}`);
};

// ─── Areas / Locations (build first — screens reference them) ───
const areaRecords = AREAS.map((a: { id: string; name: string; world: string }) => ({
  id: manifest.areas[a.id],
  world: a.world,
  randomizerName: a.name,
}));
write('areas-seed.ts', '/** Interim seed — Phase 7 vault migration ships this as fetched data instead. */', 'AreaRecord', 'AREAS_SEED', areaRecords);

const locationRecords = LOCATIONS.map((l: { id: string; name: string; areaId: string }) => ({
  id: manifest.locations[l.id],
  areaId: manifest.areas[l.areaId],
  randomizerName: l.name,
}));
write('locations-seed.ts', '/** Interim seed — Phase 7 vault migration ships this as fetched data instead. */', 'LocationRecord', 'LOCATIONS_SEED', locationRecords);

// ─── Screens ───
const missingArea: string[] = [];
const missingLocation: string[] = [];

type OldScreen = {
  id: string; name: string; world: string; location: string; area: string;
  roomIndex?: number; entranceId?: number; tags: string[]; status?: string;
  variant?: unknown; type: string; nav?: unknown;
  overworld?: { gridX: number; gridY: number };
  dungeon?: { palaceIndex: number; floor?: number; gridX?: number; gridY?: number };
  interior?: { kind: string };
};

const screenRecords = (ALL_SCREENS as OldScreen[]).map(s => {
  const areaId = areaIdOf(s.area);
  const locationId = locationIdOf(s.location);
  if (!areaId) missingArea.push(`${s.id}: area "${s.area}"`);
  if (!locationId) missingLocation.push(`${s.id}: location "${s.location}"`);

  const gameId: Record<string, number> = {};
  if (s.type === 'overworld' && s.roomIndex !== undefined) gameId.overworldIndex = s.roomIndex;
  if (s.type !== 'overworld' && s.roomIndex !== undefined) gameId.roomIndex = s.roomIndex;
  if (s.dungeon?.palaceIndex !== undefined) gameId.palaceIndex = s.dungeon.palaceIndex;
  if (s.entranceId !== undefined) gameId.entranceId = s.entranceId;

  const position = s.overworld
    ? { gridX: s.overworld.gridX, gridY: s.overworld.gridY }
    : s.dungeon && (s.dungeon.gridX !== undefined || s.dungeon.gridY !== undefined)
      ? { gridX: s.dungeon.gridX ?? 0, gridY: s.dungeon.gridY ?? 0, floor: s.dungeon.floor }
      : undefined;

  return {
    id: screenIdOf(s.id),
    gameId,
    kind: s.type,
    world: s.world,
    interiorKind: s.interior?.kind,
    randomizerName: s.name,
    areaId: areaId ?? 'area-000',
    locationId: locationId ?? 'location-000',
    position,
    tags: s.tags,
    variant: s.variant,
    status: s.status ?? 'mapped',
    nav: s.nav,
  };
});

if (missingArea.length) console.log('WARNING — screens with no area match:', missingArea);
if (missingLocation.length) console.log('WARNING — screens with no location match:', missingLocation);

write('screens-seed.ts', '/** Interim seed — Phase 7 vault migration ships this as fetched data instead. */', 'ScreenRecord', 'SCREENS_SEED', screenRecords);

// ─── Connections ───
type OldConnection = { from: string; to: string; tags: string[]; entranceId?: number; stairIndex?: number; exitId?: number; status?: string; nav?: unknown };

const missingScreen: string[] = [];
const connectionRecords = (ALL_CONNECTIONS as OldConnection[]).map((c, i) => {
  const fromScreenId = screenIdOf(c.from);
  const toScreenId = screenIdOf(c.to);
  if (!fromScreenId) missingScreen.push(c.from);
  if (!toScreenId) missingScreen.push(c.to);
  const gameId: Record<string, number> = {};
  if (c.entranceId !== undefined) gameId.entranceId = c.entranceId;
  if (c.stairIndex !== undefined) gameId.stairIndex = c.stairIndex;
  if (c.exitId !== undefined) gameId.exitId = c.exitId;
  return {
    id: manifest.connections[i]?.newId ?? `connection-${i}`,
    gameId: Object.keys(gameId).length ? gameId : undefined,
    fromScreenId: fromScreenId ?? 'screen-000',
    toScreenId: toScreenId ?? 'screen-000',
    direction: c.tags.includes('dir:one-way') ? 'one-way' : 'two-way',
    tags: c.tags,
    nav: c.nav,
  };
});

if (missingScreen.length) console.log('WARNING — connections with no screen match:', [...new Set(missingScreen)]);

write('connections-seed.ts', '/** Interim seed — Phase 7 vault migration ships this as fetched data instead; tileRange/side left undefined until derived from the flood engine\'s ConnectionNavData. */', 'ConnectionRecord', 'CONNECTIONS_SEED', connectionRecords);
