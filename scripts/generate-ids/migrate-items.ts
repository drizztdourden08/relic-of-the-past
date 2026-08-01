/**
 * @layer tooling-scripts
 * @kind logic
 *
 * Phase 3 one-time transform: unify items/definitions.ts + items/id-map.ts
 * into one id-keyed ItemRecord[] and emit it as a TS source file
 * (shared/game/data/items-seed.ts), following the id-manifest from
 * generate-ids.ts. Weapon combat profiles come from the reverse-engineering
 * research (names-and-labels plan §9), not invented.
 *
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS","moduleResolution":"node","types":["node"]}' scripts/generate-ids/migrate-items.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import { ITEMS } from '../../shared/game/items/definitions';
import { ITEM_ID_TO_NAME } from '../../shared/game/items/id-map';

const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'output/id-manifest.json'), 'utf8'));
const itemIdOf = (nativeId: number): string => manifest.items[String(nativeId)];

type Weapon = { ancillaType: number; damageClass: number; range: { kind: string; tiles?: number; sourced?: boolean } };
const WEAPON_BY_NATIVE_ID: Record<number, Weapon> = {
  0x49: { ancillaType: -1, damageClass: 1, range: { kind: 'contact', tiles: 2, sourced: true } }, // Fighter Sword
  0x01: { ancillaType: -1, damageClass: 2, range: { kind: 'contact', tiles: 2, sourced: true } }, // Master Sword
  0x02: { ancillaType: -1, damageClass: 3, range: { kind: 'contact', tiles: 2, sourced: true } }, // Tempered Sword
  0x03: { ancillaType: -1, damageClass: 4, range: { kind: 'contact', tiles: 2, sourced: true } }, // Golden Sword
  0x0b: { ancillaType: 0x09, damageClass: 6, range: { kind: 'unbounded' } },                       // Bow
  0x07: { ancillaType: 0x02, damageClass: 11, range: { kind: 'unbounded' } },                      // Fire Rod
  0x08: { ancillaType: 0x0b, damageClass: 12, range: { kind: 'unbounded' } },                      // Ice Rod
  0x0c: { ancillaType: 0x05, damageClass: 0, range: { kind: 'estimated', tiles: 8 } },              // Blue Boomerang
  0x2a: { ancillaType: 0x05, damageClass: 0, range: { kind: 'estimated', tiles: 36 } },             // Red Boomerang
  0x0a: { ancillaType: 0x1f, damageClass: 1, range: { kind: 'estimated', tiles: 16 } },             // Hookshot
};
const TIER_BY_NATIVE_ID: Record<number, number> = { 0x49: 1, 0x01: 2, 0x02: 3, 0x03: 4, 0x04: 1, 0x05: 2, 0x06: 3 };

// Vanilla duplicate-item rule (Link_HandleChest, player.c:3850) — was
// items/duplicate-alternates.ts's DUPLICATE_ALTERNATES table, now ItemRecord.aliasOf.
const ALIAS_BY_NATIVE_ID: Record<number, number> = {
  0x0c: 0x44, // Blue Boomerang → 10 Arrows
  0x12: 0x35, // Lamp → 5 Rupees
  0x2a: 0x46, // Red Boomerang → 300 Rupees
};

type ItemUnion = { id: number; name?: string; category?: string };
const union = new Map<number, ItemUnion>();
for (const it of ITEMS) union.set(it.id, { id: it.id, name: it.name, category: it.category });
for (const key of Object.keys(ITEM_ID_TO_NAME)) {
  const id = Number(key);
  const existing = union.get(id);
  const name = (ITEM_ID_TO_NAME as Record<number, string>)[id];
  if (existing) existing.name = existing.name ?? name;
  else union.set(id, { id, name });
}

const records = [...union.values()].map(({ id, name, category }) => {
  const newId = itemIdOf(id);
  const weapon = WEAPON_BY_NATIVE_ID[id];
  const tier = TIER_BY_NATIVE_ID[id];
  const aliasNativeId = ALIAS_BY_NATIVE_ID[id];
  return {
    id: newId,
    ...(id >= 0 ? { gameId: { receiveItemId: id } } : {}),
    category: category ?? 'junk',
    randomizerName: name ?? `item 0x${id.toString(16)}`,
    ...(tier ? { tier } : {}),
    ...(weapon ? { weapon } : {}),
    ...(aliasNativeId !== undefined ? { aliasOf: itemIdOf(aliasNativeId) } : {}),
  };
}).filter(r => r.id); // drop anything the manifest didn't assign an id to

const missing = [...union.keys()].filter(id => !itemIdOf(id));
if (missing.length) console.log('WARNING — native ids with no manifest entry:', missing);

const toLiteral = (v: unknown): string => {
  if (v === undefined) return 'undefined';
  if (typeof v === 'string') return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(toLiteral).join(', ')}]`;
  if (typeof v === 'object' && v !== null) {
    return `{ ${Object.entries(v).map(([k, val]) => `${k}: ${toLiteral(val)}`).join(', ')} }`;
  }
  return String(v);
};

const body = records.map(r => `  ${toLiteral(r)} as unknown as ItemRecord,`).join('\n');
const source = `/* @layer shared-game @kind data */
/**
 * Unified item catalog — merges the old items/definitions.ts (92 entries) and
 * items/id-map.ts (76 entries) into one id-keyed table (124 unique ids, 44
 * overlapping). Weapon combat profiles are reverse-engineered, not invented —
 * see the names-and-labels plan §9. Interim seed until the Phase 7 vault
 * migration ships this as fetched data instead.
 */
import type { ItemRecord } from './types';

const ITEMS_SEED: ItemRecord[] = [
${body}
];

export { ITEMS_SEED };
`;

fs.writeFileSync(path.join(__dirname, '../../shared/game/data/items-seed.ts'), source);
console.log(`Wrote ${records.length} unified item records to shared/game/data/items-seed.ts`);
