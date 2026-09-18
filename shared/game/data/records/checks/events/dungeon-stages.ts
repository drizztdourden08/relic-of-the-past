/* @layer shared-game @kind logic */
/**
 * The stage events of one dungeon, built from its rooms: started (the entrance room was
 * visited), the Big Key door unlocked, the boss reached, the boss killed (ledger, with the
 * heart as an older file's fallback), the heart container, the reward, every chest, every
 * key, and cleared. Ten records per dungeon, numbered from the dungeon's own base.
 */
import type { CheckRecord, DungeonId, ItemId, Requirement } from '@shared/game/data/types';
import { EVENT_BIT as E } from './event-bits';
import { eventId, eventRecord } from './event-record';

interface DungeonStages {
  base: number;
  dungeonId: DungeonId;
  name: string;
  /** The game's palace index (cur_palace_index_x2 >> 1). */
  palace: number;
  entranceRoom: number;
  bossRoom: number;
  bossName: string;
  /** The Big Key door: the room and the saved door bit. Absent where the dungeon has none. */
  bigKeyDoor?: { room: number; bit: number };
  /** The reward this dungeon holds in the original, for the older-file fallback. */
  vanillaPrize?: ItemId;
  /** The dungeon's Big Key item: what its Big Key door and boss door ask for. */
  bigKey?: ItemId;
  /** What the boss fight asks for, the same rule the boss's own check carries. */
  bossRequires?: Requirement;
}

const VISITED = 0x0f;
const HEART_TAKEN = 0x800;

const dungeonStageEvents = (d: DungeonStages): CheckRecord[] => {
  const { base, dungeonId, name, palace, entranceRoom, bossRoom, bossName, bigKeyDoor, vanillaPrize, bigKey, bossRequires } = d;
  const bigKeyHeld: Requirement | undefined = bigKey === undefined ? undefined : { itemId: bigKey };
  const bossFight: Requirement | undefined = bossRequires ?? bigKeyHeld;
  const bossDoor: Requirement | undefined = bigKeyHeld && bossRequires ? { allOf: [bigKeyHeld, bossRequires] } : bossFight;
  const id = (offset: number) => eventId(base + offset);
  const heart = id(4);
  const prizeFallback: Requirement | undefined = vanillaPrize === undefined ? undefined
    : { allOf: [{ checkId: heart }, { itemId: vanillaPrize }] };
  const clearedParts: Requirement[] = [{ checkId: id(6) }, { checkId: id(7) }, { checkId: id(3) }];
  if (bigKeyDoor) clearedParts.push({ checkId: id(1) });
  if (vanillaPrize !== undefined) clearedParts.push({ checkId: heart }, { checkId: id(5) });
  const records: CheckRecord[] = [
    eventRecord({ n: base + 0, name: `${name}: started`, group: 'dungeon', dungeonId, gameId: { roomId: entranceRoom, mask: VISITED } }),
    eventRecord({ n: base + 2, name: `${name}: boss reached`, group: 'dungeon', dungeonId, gameId: { roomId: bossRoom, mask: VISITED }, requirements: bossDoor }),
    eventRecord({ n: base + 3, name: `${name}: ${bossName} beaten`, group: 'dungeon', dungeonId,
      gameId: { eventBit: E.bossKilled(palace) }, fallback: { checkId: heart }, requirements: bossDoor }),
    eventRecord({ n: base + 4, name: `${name}: heart container taken`, group: 'dungeon', dungeonId, gameId: { roomId: bossRoom, mask: HEART_TAKEN }, requirements: { checkId: id(3) } }),
    eventRecord({ n: base + 6, name: `${name}: all chests opened`, group: 'dungeon', dungeonId, derivedDungeon: { dungeonId, kinds: ['chest'] } }),
    eventRecord({ n: base + 7, name: `${name}: all keys collected`, group: 'dungeon', dungeonId,
      derivedDungeon: { dungeonId, kinds: ['keyDrop', 'potItem'], tag: 'content:key' } }),
    eventRecord({ n: base + 8, name: `${name}: cleared`, group: 'dungeon', dungeonId, derived: { allOf: clearedParts } }),
  ];
  if (bigKeyDoor) {
    records.push(eventRecord({ n: base + 1, name: `${name}: Big Key door unlocked`, group: 'dungeon', dungeonId,
      gameId: { roomId: bigKeyDoor.room, mask: bigKeyDoor.bit }, requirements: bigKeyHeld }));
  }
  if (vanillaPrize !== undefined) {
    records.push(eventRecord({ n: base + 5, name: `${name}: reward taken`, group: 'dungeon', dungeonId,
      gameId: { eventBit: E.prizeTaken(palace) }, fallback: prizeFallback, requirements: { checkId: heart } }));
  }
  return records.sort((a, b) => a.id.localeCompare(b.id));
};

export { dungeonStageEvents };
export type { DungeonStages };
