/**
 * @layer tooling-scripts
 * @kind logic
 *
 * One-shot transform, committed for provenance: the seven flat *-seed.ts files
 * become the per-world / per-dungeon / per-area hierarchy of small typed .ts
 * files, in the v8 record shape. Every record's home file is derived from its own
 * geography, and every frozen id is carried byte-for-byte — the script asserts
 * count parity and id-set equality BEFORE writing anything, and writes nothing at
 * all if a single assertion fails.
 *
 * Runs --transpile-only on purpose: its inputs are the seed files and the three
 * pre-unification actor files, which no longer satisfy the v8 record types — that
 * mismatch IS the migration. Correctness comes from the runtime assertions below
 * and from typechecking the emitted hierarchy afterwards.
 *
 * Run with: npx ts-node --transpile-only --compiler-options '{"module":"CommonJS","moduleResolution":"node","types":["node"],"rootDir":".","ignoreDeprecations":"6.0"}' scripts/generate-ids/split-seeds.ts
 *
 * Its inputs were deleted in the same change, so re-running it is not possible —
 * it stands as the provenance record for the split, exactly like its migrate-*
 * siblings.
 */
import * as fs from 'fs';
import * as path from 'path';
import { SCREENS_SEED } from '../../shared/game/data/screens-seed';
import { CONNECTIONS_SEED } from '../../shared/game/data/connections-seed';
import { CHECKS_SEED } from '../../shared/game/data/checks-seed';
import { ITEMS_SEED } from '../../shared/game/data/items-seed';
import { DUNGEONS_SEED } from '../../shared/game/data/dungeons-seed';
import { AREAS_SEED } from '../../shared/game/data/areas-seed';
import { LOCATIONS_SEED } from '../../shared/game/data/locations-seed';
import { NPC_ACTORS, OBSTACLE_ACTORS, TRIGGER_ACTORS } from '../../shared/game/data/actors';
import { makeId } from '../../shared/game/data/types/ids';
import { buildKind, buildSingle } from './split/build';
import { buildGeography } from './split/layout';
import { connectionKind, counterparts, unifyActors } from './split/transform';
import { checkRows, connectionRows, itemRows, screenRows } from './split/rows';
import * as fields from './split/fields';
import * as assert from './split/assertions';
import type { FileMap } from './split/build';
import type {
  Loose, SeedActor, SeedArea, SeedCheck, SeedConnection, SeedDungeon, SeedItem,
  SeedLocation, SeedScreen,
} from './split/seed-types';

const DATA_DIR = path.join(__dirname, '../../shared/game/data');
const SEED_DOC = '/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */';

/**
 * The four checks that record pure story progress and name no screen. All four
 * are light-world content; the assertion below fails loudly if the screen-less
 * set ever changes, rather than letting a new record default silently.
 */
const SCREENLESS_CHECK_WORLD: Record<string, 'light' | 'dark'> = {
  'check-002': 'light',
  'check-003': 'light',
  'check-004': 'light',
  'check-042': 'light',
};

const screens = SCREENS_SEED as unknown as SeedScreen[];
const connections = CONNECTIONS_SEED as unknown as SeedConnection[];
const checks = CHECKS_SEED as unknown as SeedCheck[];
const items = ITEMS_SEED as unknown as SeedItem[];
const dungeons = DUNGEONS_SEED as unknown as SeedDungeon[];
const areas = AREAS_SEED as unknown as SeedArea[];
const locations = LOCATIONS_SEED as unknown as SeedLocation[];

const geo = buildGeography(screens, areas, dungeons);

const kindCache = new Map<string, string>();
const kindOf = (c: SeedConnection): string => {
  const cached = kindCache.get(c.id);
  if (cached !== undefined) return cached;
  const kind = connectionKind(c, geo);
  kindCache.set(c.id, kind);
  return kind;
};
const pairs = counterparts(connections, kindOf);

const worldOfCheck = (check: SeedCheck): 'light' | 'dark' => {
  const screen = check.screenId ? geo.screenById.get(check.screenId) : undefined;
  if (screen) return screen.world;
  const declared = SCREENLESS_CHECK_WORLD[check.id];
  if (!declared) throw new Error(`check ${check.id} names no screen and has no declared world`);
  return declared;
};

const actors = unifyActors(
  [
    { kind: 'npc', records: NPC_ACTORS as unknown as SeedActor[] },
    { kind: 'obstacle', records: OBSTACLE_ACTORS as unknown as SeedActor[] },
    { kind: 'trigger', records: TRIGGER_ACTORS as unknown as SeedActor[] },
  ],
  n => makeId('actor', n),
);

const files: FileMap = new Map();

const screenGroups = buildKind(screenRows(screens, geo), {
  root: 'screens', typeName: 'ScreenRecord', constSuffix: 'SCREENS', order: fields.SCREEN_FIELDS, doc: SEED_DOC,
}, files);

const connectionGroups = buildKind(connectionRows(connections, { geo, kindOf, pairs }), {
  root: 'connections', typeName: 'ConnectionRecord', constSuffix: 'CONNECTIONS', order: fields.CONNECTION_FIELDS,
  alwaysEmit: ['connections/light-world/special'], doc: SEED_DOC,
}, files);

const checkGroups = buildKind(checkRows(checks, worldOfCheck), {
  root: 'checks', typeName: 'CheckRecord', constSuffix: 'CHECKS', order: fields.CHECK_FIELDS,
  alwaysEmit: ['checks/light-world', 'checks/dark-world', 'checks/dungeons'], doc: SEED_DOC,
}, files);

const itemGroups = buildKind(itemRows(items), {
  root: 'items', typeName: 'ItemRecord', constSuffix: 'ITEMS', order: fields.ITEM_FIELDS, doc: SEED_DOC,
}, files);

const actorGroups = buildKind(actors.map(a => ({ file: `actors/${String(a.record.kind)}s`, record: a.record })), {
  root: 'actors', typeName: 'ActorRecord', constSuffix: 'ACTORS', order: fields.ACTOR_FIELDS, doc: SEED_DOC,
}, files);

buildSingle(dungeons as unknown as Loose[], 'dungeons', {
  typeName: 'DungeonRecord', constSuffix: 'DUNGEONS', order: fields.DUNGEON_FIELDS, doc: SEED_DOC,
}, files);
buildSingle(areas as unknown as Loose[], 'areas', {
  typeName: 'AreaRecord', constSuffix: 'AREAS', order: fields.AREA_FIELDS, doc: SEED_DOC,
}, files);
buildSingle(locations as unknown as Loose[], 'locations', {
  typeName: 'LocationRecord', constSuffix: 'LOCATIONS', order: fields.LOCATION_FIELDS, doc: SEED_DOC,
}, files);

// ─── The gate ───────────────────────────────────────────────────────────────
const flat = (groups: Map<string, Loose[]>): Loose[] => [...groups.values()].flat();
const ids = (records: readonly Loose[]): string[] => records.map(r => String(r.id));

const emitted = {
  screen: flat(screenGroups), connection: flat(connectionGroups), check: flat(checkGroups),
  item: flat(itemGroups), actor: flat(actorGroups),
  dungeon: dungeons as unknown as Loose[], area: areas as unknown as Loose[],
  location: locations as unknown as Loose[],
};
const seeds: Record<string, Loose[]> = {
  screen: screens as unknown as Loose[], connection: connections as unknown as Loose[],
  check: checks as unknown as Loose[], item: items as unknown as Loose[],
  dungeon: emitted.dungeon, area: emitted.area, location: emitted.location,
  actor: actors.map(a => a.record),
};

for (const [kind, expected] of Object.entries(fields.EXPECTED_COUNTS)) {
  const records = emitted[kind as keyof typeof emitted];
  assert.expectCount(kind, records.length, expected);
  assert.expectIdSets(kind, ids(seeds[kind]), ids(records));
  assert.expectRequired(kind, records, fields.REQUIRED[kind as keyof typeof fields.REQUIRED]);
}
assert.expectSymmetry(pairs);
assert.expectPlacements(emitted.connection);
assert.expectSameFiles('actor id namespace', ids(emitted.actor), actors.map((_, i) => makeId('actor', i + 1)));
assert.expectSameFiles('screen-less checks', Object.keys(SCREENLESS_CHECK_WORLD),
  checks.filter(c => !c.screenId).map(c => c.id));
assert.expectResolves('connection.counterpartId', emitted.connection.map(c => c.counterpartId as string | undefined),
  new Set(ids(emitted.connection)));
assert.expectResolves('connection.dungeonId', emitted.connection.map(c => c.dungeonId as string | undefined),
  new Set(ids(emitted.dungeon)));

const failures = assert.report();
if (failures.length) {
  console.error(`\n${failures.length} assertion failure(s) — nothing written:\n`);
  for (const line of failures) console.error(`  ✗ ${line}`);
  process.exit(1);
}

// ─── Write ──────────────────────────────────────────────────────────────────
for (const [rel, source] of [...files].sort()) {
  const target = path.join(DATA_DIR, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, source);
}

const tally = (records: readonly Loose[], field: string): Record<string, number> => {
  const out: Record<string, number> = {};
  for (const r of records) {
    const key = r[field] === undefined ? '(absent)' : String(r[field]);
    out[key] = (out[key] ?? 0) + 1;
  }
  return out;
};

console.log(`Wrote ${files.size} files under shared/game/data/`);
console.log('connection kinds:', tally(emitted.connection, 'kind'));
console.log('connection placement:', tally(emitted.connection, 'placement'));
console.log(`counterpart pairs: ${pairs.size / 2} (${pairs.size} records)`);
console.log('connection dungeonId set:', emitted.connection.filter(c => c.dungeonId !== undefined).length);
console.log('actor kinds:', tally(emitted.actor, 'kind'));
console.log('actor id map:', actors.map(a => `${a.oldId}→${String(a.record.id)}`).join(' '));
