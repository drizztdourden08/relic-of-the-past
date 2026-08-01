/**
 * @layer tooling-scripts
 * @kind logic
 *
 * One-time id-assignment generator (names-and-labels plan, §5/§14 step 2).
 * Reads the CURRENT (pre-migration) data modules, assigns each entity a
 * frozen `<type>-<n>` id per the plan's sort keys, and writes a migration
 * manifest the Phase 3-6 migration work consumes to trace old identifiers to
 * new ids. The manifest is a build-time artifact, not part of the shipped
 * data model — no legacy field survives into the final records.
 *
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS","moduleResolution":"node"}' scripts/generate-ids/generate-ids.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import { ALL_SCREENS } from '../../shared/game/data/screens/index';
import { ALL_CONNECTIONS } from '../../shared/game/data/connections/index';
import { AREAS } from '../../shared/game/data/screens/areas';
import { LOCATIONS } from '../../shared/game/data/screens/locations';
import { LIGHT_WORLD_CHECKS } from '../../shared/game/checks/light-world-checks';
import { DARK_WORLD_CHECKS } from '../../shared/game/checks/dark-world-checks';
import { DUNGEON_CHECKS } from '../../shared/game/checks/dungeons';
import { ITEMS } from '../../shared/game/items/definitions';
import { ITEM_ID_TO_NAME } from '../../shared/game/items/id-map';
import { ID_PAD_WIDTH } from '../../shared/game/data/types/ids';

const OUT_DIR = path.join(__dirname, 'output');
fs.mkdirSync(OUT_DIR, { recursive: true });

const pad = (n: number): string => String(n).padStart(ID_PAD_WIDTH, '0');

// ─── Screens: world (light→dark), then kind, then native index ascending ───
const screenSortKey = (s: (typeof ALL_SCREENS)[number]): [number, number, number] => {
  const worldRank = s.world === 'light' ? 0 : 1;
  const kindRank = s.type === 'overworld' ? 0 : s.type === 'dungeon' ? 1 : 2;
  const nativeIndex = s.type === 'overworld' ? (s as { overworld: { gridX: number; gridY: number } }).overworld.gridX
    : (s.roomIndex ?? 0);
  return [worldRank, kindRank, nativeIndex];
};
const sortedScreens = [...ALL_SCREENS].sort((a, b) => {
  const ka = screenSortKey(a), kb = screenSortKey(b);
  return ka[0] - kb[0] || ka[1] - kb[1] || ka[2] - kb[2] || a.id.localeCompare(b.id);
});
const screenIdMap = new Map<string, string>();
sortedScreens.forEach((s, i) => screenIdMap.set(s.id, `screen-${pad(i + 1)}`));

// ─── Connections: (from's assigned id, to's assigned id) ascending ───
const sortedConnections = [...ALL_CONNECTIONS].sort((a, b) => {
  const fa = screenIdMap.get(a.from) ?? a.from, fb = screenIdMap.get(b.from) ?? b.from;
  if (fa !== fb) return fa.localeCompare(fb);
  const ta = screenIdMap.get(a.to) ?? a.to, tb = screenIdMap.get(b.to) ?? b.to;
  return ta.localeCompare(tb);
});
const connectionRecords = sortedConnections.map((c, i) => ({
  newId: `connection-${pad(i + 1)}`, from: c.from, to: c.to,
}));

// ─── Checks: light-world file order, then dark-world, then dungeons ───
const allChecksInOrder = [...LIGHT_WORLD_CHECKS, ...DARK_WORLD_CHECKS, ...DUNGEON_CHECKS];
const checkIdMap = new Map<string, string>();
allChecksInOrder.forEach((c, i) => checkIdMap.set(c.id, `check-${pad(i + 1)}`));

// ─── Items: native receiveItemId ascending (union of both tables); synthetic (negative) ids last ───
type ItemUnion = { id: number; source: 'definitions' | 'id-map' | 'both' };
const itemUnion = new Map<number, ItemUnion>();
for (const it of ITEMS) itemUnion.set(it.id, { id: it.id, source: 'definitions' });
for (const key of Object.keys(ITEM_ID_TO_NAME)) {
  const id = Number(key);
  if (itemUnion.has(id)) itemUnion.get(id)!.source = 'both';
  else itemUnion.set(id, { id, source: 'id-map' });
}
const nativeItems = [...itemUnion.values()].filter(i => i.id >= 0).sort((a, b) => a.id - b.id);
const syntheticItems = [...itemUnion.values()].filter(i => i.id < 0).sort((a, b) => b.id - a.id); // -1, -2, ...
const orderedItems = [...nativeItems, ...syntheticItems];
const itemIdMap = new Map<number, string>();
orderedItems.forEach((it, i) => itemIdMap.set(it.id, `item-${pad(i + 1)}`));

// ─── Dungeons: the game's own progression order ───
const DUNGEON_PROGRESSION_ORDER = [
  'Hyrule Castle', 'Castle Tower', 'Eastern Palace', 'Desert Palace', 'Tower of Hera',
  'Palace of Darkness', 'Swamp Palace', 'Skull Woods', "Thieves' Town", 'Ice Palace',
  'Misery Mire', 'Turtle Rock', "Ganon's Tower",
];
const dungeonNamesFound = [...new Set(DUNGEON_CHECKS.map(c => c.dungeon).filter((d): d is string => !!d))];
const orderedDungeons = DUNGEON_PROGRESSION_ORDER.filter(name => dungeonNamesFound.includes(name));
const missingFromOrder = dungeonNamesFound.filter(name => !DUNGEON_PROGRESSION_ORDER.includes(name));
const dungeonIdMap = new Map<string, string>();
[...orderedDungeons, ...missingFromOrder].forEach((name, i) => dungeonIdMap.set(name, `dungeon-${pad(i + 1)}`));

// ─── Areas / Locations: alphabetical by current slug ───
const sortedAreas = [...AREAS].sort((a, b) => a.id.localeCompare(b.id));
const areaIdMap = new Map<string, string>();
sortedAreas.forEach((a, i) => areaIdMap.set(a.id, `area-${pad(i + 1)}`));

const sortedLocations = [...LOCATIONS].sort((a, b) => a.id.localeCompare(b.id));
const locationIdMap = new Map<string, string>();
sortedLocations.forEach((l, i) => locationIdMap.set(l.id, `location-${pad(i + 1)}`));

// ─── Write the manifest ───
const manifest = {
  generatedFrom: 'scripts/generate-ids/generate-ids.ts',
  counts: {
    screen: sortedScreens.length, connection: connectionRecords.length, check: allChecksInOrder.length,
    item: orderedItems.length, dungeon: dungeonIdMap.size, area: sortedAreas.length, location: sortedLocations.length,
  },
  screens: Object.fromEntries(screenIdMap),
  connections: connectionRecords,
  checks: Object.fromEntries(checkIdMap),
  items: Object.fromEntries([...itemIdMap.entries()].map(([k, v]) => [String(k), v])),
  dungeons: Object.fromEntries(dungeonIdMap),
  areas: Object.fromEntries(areaIdMap),
  locations: Object.fromEntries(locationIdMap),
};

fs.writeFileSync(path.join(OUT_DIR, 'id-manifest.json'), JSON.stringify(manifest, null, 2));

console.log('Counts:', manifest.counts);
if (missingFromOrder.length) console.log('Dungeons not in the canonical progression list (appended at the end):', missingFromOrder);
console.log('Wrote', path.join(OUT_DIR, 'id-manifest.json'));
