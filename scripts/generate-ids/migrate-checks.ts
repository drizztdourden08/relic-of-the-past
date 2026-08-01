/**
 * @layer tooling-scripts
 * @kind logic
 *
 * Phase 4 one-time transform: merge CheckDefinition (light/dark-world-checks.ts,
 * dungeons.ts) with all four checks/flags/*.ts side-tables into one CheckRecord
 * per check, following the id-manifest from generate-ids.ts. Emits checks-seed.ts.
 *
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS","moduleResolution":"node","types":["node"]}' scripts/generate-ids/migrate-checks.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import { LIGHT_WORLD_CHECKS } from '../../shared/game/checks/light-world-checks';
import { DARK_WORLD_CHECKS } from '../../shared/game/checks/dark-world-checks';
import { DUNGEON_CHECKS } from '../../shared/game/checks/dungeons';
import { CHECK_ROOM_FLAGS, DIRECT_ROOM_FLAGS } from '../../shared/game/checks/flags/room';
import { CHECK_NPC_FLAGS } from '../../shared/game/checks/flags/npc';
import { CHECK_EVENT_FLAGS } from '../../shared/game/checks/flags/event';
import { CHECK_OVERWORLD_FLAGS } from '../../shared/game/checks/flags/overworld';
import { ITEMS_SEED } from '../../shared/game/data/items-seed';
import { SCREENS_SEED } from '../../shared/game/data/screens-seed';

const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'output/id-manifest.json'), 'utf8'));
const checkIdOf = (oldId: string): string => manifest.checks[oldId];
const screenIdOf = (oldId: string): string => manifest.screens[oldId];
const dungeonIdOf = (name: string): string | undefined => manifest.dungeons[name];

type SeedScreen = { id: string; gameId: { roomIndex?: number; overworldIndex?: number; palaceIndex?: number } };
const screenByRoomIndex = new Map<number, SeedScreen[]>();
const screenByOverworldIndex = new Map<number, SeedScreen>();
for (const s of SCREENS_SEED as unknown as SeedScreen[]) {
  if (s.gameId.roomIndex !== undefined) {
    const list = screenByRoomIndex.get(s.gameId.roomIndex) ?? [];
    list.push(s);
    screenByRoomIndex.set(s.gameId.roomIndex, list);
  }
  if (s.gameId.overworldIndex !== undefined) screenByOverworldIndex.set(s.gameId.overworldIndex, s);
}
/** Screen name string didn't match — fall back to the check's own native room/OW index, when known. */
const screenIdByNativeIndex = (roomId?: number, owScreen?: number, palaceIndex?: number): string | undefined => {
  if (owScreen !== undefined) return screenByOverworldIndex.get(owScreen)?.id;
  if (roomId === undefined) return undefined;
  const candidates = screenByRoomIndex.get(roomId);
  if (!candidates || candidates.length === 0) return undefined;
  if (palaceIndex !== undefined) {
    const exact = candidates.find(s => s.gameId.palaceIndex === palaceIndex);
    if (exact) return exact.id;
  }
  return candidates[0].id;
};

const itemIdByName = new Map<string, string>();
for (const item of ITEMS_SEED as unknown as { id: string; randomizerName: string }[]) {
  itemIdByName.set(item.randomizerName, item.id);
}
// checks/*.ts's vanillaItem uses a slightly different naming convention than
// items-seed.ts's randomizerName for a handful of consumables — a real naming
// inconsistency the plan's naming-reassessment phase should resolve properly;
// bridged here so the migration doesn't silently drop the link.
const VANILLA_ITEM_ALIASES: Record<string, string> = {
  'Heart Piece': 'Piece of Heart',
  '3 Bombs': 'Bomb',
};
const itemIdFor = (name: string): string | undefined =>
  itemIdByName.get(name) ?? itemIdByName.get(VANILLA_ITEM_ALIASES[name] ?? '');

type OldCheck = {
  id: string; name: string; type: string; screen: string; dungeon?: string;
  vanillaItem?: string | string[]; roomId?: number; chestIndex?: number;
};

const allChecks = [...LIGHT_WORLD_CHECKS, ...DARK_WORLD_CHECKS, ...DUNGEON_CHECKS] as OldCheck[];

const missingScreen: string[] = [];
const missingItem: string[] = [];
const unmatchedByAnyFlags: string[] = [];

// npcFlag.presence conditions were transcribed with the OLD `{item: name}` leaf
// shape (checks/presence-condition.ts); CheckRecord.presence uses `{itemId}` like
// every other item reference, so leaves get resolved through the same item lookup.
const convertPresence = (p: unknown): unknown => {
  if (p === null || typeof p !== 'object') return p;
  const cond = p as Record<string, unknown>;
  if ('item' in cond) {
    const id = itemIdFor(cond.item as string);
    if (!id) missingItem.push(`presence item "${cond.item as string}"`);
    return { itemId: id, owned: cond.owned };
  }
  if ('and' in cond) return { and: (cond.and as unknown[]).map(convertPresence) };
  if ('or' in cond) return { or: (cond.or as unknown[]).map(convertPresence) };
  if ('not' in cond) return { not: convertPresence(cond.not) };
  return cond;
};

const records = allChecks.map(c => {
  const gameId: Record<string, unknown> = {};

  const roomFlag = CHECK_ROOM_FLAGS[c.id] as { roomId: number; chestIndex: number } | undefined;
  if (roomFlag) { gameId.roomId = roomFlag.roomId; gameId.chestIndex = roomFlag.chestIndex; }

  const directFlag = DIRECT_ROOM_FLAGS[c.id] as { roomId: number; mask: number } | undefined;
  if (directFlag) { gameId.roomId = directFlag.roomId; gameId.mask = directFlag.mask; }

  const owFlag = CHECK_OVERWORLD_FLAGS[c.id] as { screen: number; mask: number } | undefined;
  if (owFlag) { gameId.owScreen = owFlag.screen; gameId.mask = owFlag.mask; }

  const eventFlag = CHECK_EVENT_FLAGS[c.id] as { bufferIndex: number; compare: string; value: number | number[] } | undefined;
  if (eventFlag) { gameId.bufferIndex = eventFlag.bufferIndex; gameId.compare = eventFlag.compare; gameId.value = eventFlag.value; }

  let visualNote: string | undefined;
  let sourceFunc: string | undefined;
  const npcFlag = CHECK_NPC_FLAGS[c.id] as {
    bufferIndex: number; mask: number; flagType: number; flagMask: number;
    roomFlag?: { roomId: number; chestIndex: number }; itemId: number; spriteType: number; postGfx: number;
    room?: number; owWorld?: 'light' | 'dark'; visualNote: string; sourceFunc: string; presence?: unknown;
  } | undefined;
  let presence: unknown;
  if (npcFlag) {
    gameId.bufferIndex = npcFlag.bufferIndex;
    gameId.mask = npcFlag.mask;
    gameId.flagType = npcFlag.flagType;
    gameId.flagMask = npcFlag.flagMask;
    gameId.itemId = npcFlag.itemId;
    if (npcFlag.roomFlag) gameId.roomFlag = npcFlag.roomFlag;
    gameId.spriteType = npcFlag.spriteType;
    gameId.postGfx = npcFlag.postGfx;
    if (npcFlag.room !== undefined) gameId.room = npcFlag.room;
    if (npcFlag.owWorld) gameId.owWorld = npcFlag.owWorld;
    visualNote = npcFlag.visualNote;
    sourceFunc = npcFlag.sourceFunc;
    presence = npcFlag.presence ? convertPresence(npcFlag.presence) : undefined;
  }

  if (Object.keys(gameId).length === 0) unmatchedByAnyFlags.push(c.id);

  const newScreenId = screenIdOf(c.screen)
    ?? screenIdByNativeIndex(gameId.roomId as number | undefined, gameId.owScreen as number | undefined);
  if (!newScreenId) missingScreen.push(`${c.id}: screen "${c.screen}"`);

  const vanillaNames = Array.isArray(c.vanillaItem) ? c.vanillaItem : c.vanillaItem ? [c.vanillaItem] : [];
  const vanillaItemIds = vanillaNames.map(name => {
    const id = itemIdFor(name);
    if (!id) missingItem.push(`${c.id}: vanillaItem "${name}"`);
    return id;
  }).filter((id): id is string => !!id);

  return {
    id: checkIdOf(c.id),
    gameId,
    kind: c.type,
    screenId: newScreenId,
    dungeonId: c.dungeon ? dungeonIdOf(c.dungeon) : undefined,
    randomizerName: c.name,
    vanillaItemIds,
    presence,
    visualNote,
    sourceFunc,
  };
});

if (missingScreen.length) console.log(`WARNING — ${missingScreen.length} checks with no screen match:`, missingScreen);
if (missingItem.length) console.log(`WARNING — ${missingItem.length} vanillaItem names with no item match:`, missingItem);
console.log(`${unmatchedByAnyFlags.length} of ${allChecks.length} checks matched no flags table:`, unmatchedByAnyFlags);

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

const body = records.map(r => `  ${toLiteral(r)} as unknown as CheckRecord,`).join('\n');
const source = `/* @layer shared-game @kind data */
/**
 * Unified check catalog — merges CheckDefinition (light/dark-world-checks.ts,
 * dungeons.ts, 265 entries) with the four checks/flags/*.ts side-tables into
 * one id-keyed table. Interim seed until the Phase 7 vault migration ships
 * this as fetched data instead.
 */
import type { CheckRecord } from './types';

const CHECKS_SEED: CheckRecord[] = [
${body}
];

export { CHECKS_SEED };
`;

fs.writeFileSync(path.join(__dirname, '../../shared/game/data/checks-seed.ts'), source);
console.log(`Wrote ${records.length} unified check records to shared/game/data/checks-seed.ts`);
