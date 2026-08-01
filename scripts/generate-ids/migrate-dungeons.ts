/**
 * @layer tooling-scripts
 * @kind logic
 *
 * Phase 3b one-time transform: build the unified DungeonRecord table (13
 * dungeons) from the id-manifest's dungeon list, DUNGEON_PALACE_VALUES'
 * native palace indices, the migrated checks-seed.ts (boss/prize check ids
 * per dungeon), and the migrated screens-seed.ts (room screen ids per
 * palace). This closes the "no unified Dungeon record" gap the original
 * audit found — boss/prize/medallion facts were duplicated across
 * checks/dungeons.ts and checks/flags/room.ts.
 *
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS","moduleResolution":"node","types":["node"]}' scripts/generate-ids/migrate-dungeons.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import { DUNGEON_PALACE_VALUES } from '../../shared/game/data/screens/game-values/palace-indices';
import { CHECKS_SEED } from '../../shared/game/data/checks-seed';
import { SCREENS_SEED } from '../../shared/game/data/screens-seed';
import { ITEMS_SEED } from '../../shared/game/data/items-seed';

const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'output/id-manifest.json'), 'utf8'));

type SeedCheck = { id: string; kind: string; dungeonId?: string };
type SeedScreen = { id: string; gameId: { palaceIndex?: number } };
type SeedItem = { id: string; randomizerName: string };

const checks = CHECKS_SEED as unknown as SeedCheck[];
const screens = SCREENS_SEED as unknown as SeedScreen[];
const itemIdByName = new Map((ITEMS_SEED as unknown as SeedItem[]).map(i => [i.randomizerName, i.id]));

// Vanilla-mode default medallion gates (logic/presets/vanilla.ts).
const MEDALLION_GATES: Record<string, string> = {
  'Misery Mire': 'Ether',
  'Turtle Rock': 'Quake',
};

const records = Object.entries(manifest.dungeons as Record<string, string>).map(([name, id]) => {
  const palaceValues: number[] = DUNGEON_PALACE_VALUES[name] ?? [];
  const boss = checks.find(c => c.dungeonId === id && c.kind === 'boss');
  const prize = checks.find(c => c.dungeonId === id && c.kind === 'prize');
  const roomScreenIds = screens.filter(s => palaceValues.includes(s.gameId.palaceIndex ?? -1)).map(s => s.id);
  const medallionName = MEDALLION_GATES[name];

  return {
    id,
    gameId: { palaceIndex: palaceValues[0] },
    randomizerName: name,
    bossCheckId: boss?.id,
    prizeCheckId: prize?.id,
    medallionGate: medallionName ? itemIdByName.get(medallionName) : undefined,
    roomScreenIds,
  };
});

const noBoss = records.filter(r => !r.bossCheckId).map(r => r.randomizerName);
if (noBoss.length) console.log('Dungeons with no boss check found (expected for Hyrule Castle/Castle Tower):', noBoss);
const noRooms = records.filter(r => r.roomScreenIds.length === 0).map(r => r.randomizerName);
if (noRooms.length) console.log('WARNING — dungeons with zero room screens:', noRooms);

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

const body = records.map(r => `  ${toLiteral(r)} as unknown as DungeonRecord,`).join('\n');
const source = `/* @layer shared-game @kind data */
/**
 * Unified dungeon catalog — closes the "no unified Dungeon record" gap:
 * boss/prize/medallion facts were duplicated across checks/dungeons.ts and
 * checks/flags/room.ts. Interim seed until the Phase 7 vault migration ships
 * this as fetched data instead.
 */
import type { DungeonRecord } from './types';

const DUNGEONS_SEED: DungeonRecord[] = [
${body}
];

export { DUNGEONS_SEED };
`;

fs.writeFileSync(path.join(__dirname, '../../shared/game/data/dungeons-seed.ts'), source);
console.log(`Wrote ${records.length} unified dungeon records to shared/game/data/dungeons-seed.ts`);
