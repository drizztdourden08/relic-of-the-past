/* @layer shared-game @kind data */
/**
 * The dungeon stage events, ten ids per dungeon from number 60 of the events' range.
 * Rooms and door bits are from the ROM's own tables (the door table gives the Big Key doors,
 * the entrance table the first rooms). Every dungeon takes its own block of ten even where a
 * stage is absent, so the ids stay stable when one is added.
 */
import type { CheckRecord, DungeonId, ItemId, Requirement } from '@shared/game/data/types';
import { canKillMostThings, canLiftRocks, canMeltThings, hasMeleeWeapon, hasSword } from '@shared/game/data/requirements/helpers';
import { dungeonStageEvents } from './dungeon-stages';
import { eventRecord } from './event-record';
import { EVENT_BIT as E } from './event-bits';

const GREEN_PENDANT = 'item-109' as ItemId;
const BLUE_PENDANT = 'item-110' as ItemId;
const RED_PENDANT = 'item-111' as ItemId;
const crystal = (n: number): ItemId => `item-${111 + n}` as ItemId;
const item = (id: string): Requirement => ({ itemId: id as ItemId });
/** The Big Key items, by dungeon (records/items/dungeon-items-2.ts). */
const BK = { eastern: 'item-094', desert: 'item-093', hera: 'item-087', darkness: 'item-091', swamp: 'item-092', skull: 'item-089', thieves: 'item-086', ice: 'item-088', mire: 'item-090', turtle: 'item-085', ganon: 'item-084' } as Record<string, ItemId>;
const dungeon = (n: number): DungeonId => `dungeon-${String(n).padStart(3, '0')}` as DungeonId;

const DUNGEON_EVENTS: CheckRecord[] = [
  ...dungeonStageEvents({ base: 60, dungeonId: dungeon(3), name: 'Eastern Palace', palace: 2, entranceRoom: 0xc9, bossRoom: 0xc8,
    bossName: 'Armos Knights', bigKeyDoor: { room: 0xa9, bit: 0x2000 }, vanillaPrize: GREEN_PENDANT, bigKey: BK.eastern, bossRequires: { allOf: [hasSword, item('item-012')] } }),
  ...dungeonStageEvents({ base: 70, dungeonId: dungeon(4), name: 'Desert Palace', palace: 3, entranceRoom: 0x84, bossRoom: 0x33,
    bossName: 'Lanmolas', bigKeyDoor: { room: 0x43, bit: 0x8000 }, vanillaPrize: BLUE_PENDANT, bigKey: BK.desert, bossRequires: { allOf: [canKillMostThings, item('item-019')] } }),
  ...dungeonStageEvents({ base: 80, dungeonId: dungeon(5), name: 'Tower of Hera', palace: 10, entranceRoom: 0x77, bossRoom: 0x07,
    bossName: 'Moldorm', bigKeyDoor: { room: 0x31, bit: 0x8000 }, vanillaPrize: RED_PENDANT, bigKey: BK.hera, bossRequires: hasMeleeWeapon }),
  ...dungeonStageEvents({ base: 90, dungeonId: dungeon(2), name: "Agahnim's Tower", palace: 4, entranceRoom: 0xe0, bossRoom: 0x20,
    bossName: 'Agahnim', bossRequires: { allOf: [hasSword, item('item-019')] } }),
  ...dungeonStageEvents({ base: 100, dungeonId: dungeon(6), name: 'Palace of Darkness', palace: 6, entranceRoom: 0x4a, bossRoom: 0x5a,
    bossName: 'Helmasaur King', bigKeyDoor: { room: 0x6a, bit: 0x8000 }, vanillaPrize: crystal(1), bigKey: BK.darkness, bossRequires: { allOf: [item('item-010'), item('item-012'), item('item-019')] } }),
  ...dungeonStageEvents({ base: 110, dungeonId: dungeon(7), name: 'Swamp Palace', palace: 5, entranceRoom: 0x28, bossRoom: 0x06,
    bossName: 'Arrghus', vanillaPrize: crystal(2), bigKey: BK.swamp, bossRequires: { allOf: [item('item-011'), item('item-031')] } }),
  ...dungeonStageEvents({ base: 120, dungeonId: dungeon(8), name: 'Skull Woods', palace: 8, entranceRoom: 0x58, bossRoom: 0x29,
    bossName: 'Mothula', vanillaPrize: crystal(3), bigKey: BK.skull, bossRequires: { allOf: [item('item-008'), hasSword] } }),
  ...dungeonStageEvents({ base: 130, dungeonId: dungeon(9), name: "Thieves' Town", palace: 11, entranceRoom: 0xdb, bossRoom: 0xac,
    bossName: 'Blind', bigKeyDoor: { room: 0xcc, bit: 0x8000 }, vanillaPrize: crystal(4), bigKey: BK.thieves, bossRequires: canKillMostThings }),
  ...dungeonStageEvents({ base: 140, dungeonId: dungeon(10), name: 'Ice Palace', palace: 9, entranceRoom: 0x0e, bossRoom: 0xde,
    bossName: 'Kholdstare', bigKeyDoor: { room: 0x9e, bit: 0x4000 }, vanillaPrize: crystal(5), bigKey: BK.ice, bossRequires: { allOf: [canMeltThings, item('item-010'), canLiftRocks] } }),
  ...dungeonStageEvents({ base: 150, dungeonId: dungeon(11), name: 'Misery Mire', palace: 7, entranceRoom: 0x98, bossRoom: 0x90,
    bossName: 'Vitreous', bigKeyDoor: { room: 0xa0, bit: 0x8000 }, vanillaPrize: crystal(6), bigKey: BK.mire, bossRequires: { allOf: [item('item-022'), item('item-019'), canKillMostThings] } }),
  ...dungeonStageEvents({ base: 160, dungeonId: dungeon(12), name: 'Turtle Rock', palace: 12, entranceRoom: 0xd6, bossRoom: 0xa4,
    bossName: 'Trinexx', bigKeyDoor: { room: 0x24, bit: 0x8000 }, vanillaPrize: crystal(7), bigKey: BK.turtle, bossRequires: { allOf: [item('item-008'), item('item-009'), item('item-022'), item('item-019')] } }),
  ...dungeonStageEvents({ base: 170, dungeonId: dungeon(13), name: "Ganon's Tower", palace: 13, entranceRoom: 0x0c, bossRoom: 0x0d,
    bossName: 'Agahnim', bigKeyDoor: { room: 0x6b, bit: 0x8000 }, bigKey: BK.ganon, bossRequires: { allOf: [hasSword, item('item-011'), item('item-012'), item('item-019'), item('item-010'), item('item-022')] } }),
  // Hyrule Castle has no boss: its stages are the escape.
  eventRecord({ n: 180, name: 'Hyrule Castle: started', group: 'dungeon', dungeonId: dungeon(1), gameId: { roomId: 0x61, mask: 0x0f } }),
  eventRecord({ n: 181, name: 'Hyrule Castle: sewers reached', group: 'dungeon', dungeonId: dungeon(1), gameId: { roomId: 0x51, mask: 0x0f } }),
  eventRecord({ n: 182, name: 'Hyrule Castle: cleared', group: 'dungeon', dungeonId: dungeon(1), derived: { checkId: 'check-004' } }),
  // The extra parts and the rematches.
  eventRecord({ n: 183, name: 'Desert Palace: back section entered', group: 'dungeon', dungeonId: dungeon(4), gameId: { roomId: 0x63, mask: 0x0f } }),
  eventRecord({ n: 184, name: 'Skull Woods: back section entered', group: 'dungeon', dungeonId: dungeon(8), gameId: { roomId: 0x59, mask: 0x0f } }),
  eventRecord({ n: 185, name: 'Swamp Palace: past the flooded entrance', group: 'dungeon', dungeonId: dungeon(7), gameId: { roomId: 0x38, mask: 0x0f } }),
  eventRecord({ n: 186, name: "Thieves' Town: attic floor bombed", group: 'dungeon', dungeonId: dungeon(9), gameId: { roomId: 0x65, mask: 0x100 } }),
  eventRecord({ n: 187, name: "Ganon's Tower: Armos Knights rematch beaten", group: 'dungeon', dungeonId: dungeon(13), gameId: { eventBit: E.rematchArmos } }),
  eventRecord({ n: 188, name: "Ganon's Tower: Lanmolas rematch beaten", group: 'dungeon', dungeonId: dungeon(13), gameId: { eventBit: E.rematchLanmolas } }),
  eventRecord({ n: 189, name: "Ganon's Tower: Moldorm rematch beaten", group: 'dungeon', dungeonId: dungeon(13), gameId: { eventBit: E.rematchMoldorm } }),
  eventRecord({ n: 190, name: "Ganon's Tower: final door unlocked", group: 'dungeon', dungeonId: dungeon(13), gameId: { roomId: 0x1d, mask: 0x8000 } }),
  eventRecord({ n: 191, name: 'Turtle Rock: Big Chest ledge entered from outside', group: 'dungeon', dungeonId: dungeon(12), gameId: { eventBit: E.turtleRockBigChestLedge } }),
  eventRecord({ n: 192, name: 'Turtle Rock: Laser Bridge entered from outside', group: 'dungeon', dungeonId: dungeon(12), gameId: { eventBit: E.turtleRockLaserBridge } }),
  ...[0, 1, 2, 3, 4].map((n) => eventRecord({ n: 193 + n, name: `Skull Woods: front entrance ${n + 1} used`, group: 'dungeon', dungeonId: dungeon(8),
    gameId: { eventBit: E.skullWoodsEntrance(n) } })),
];

export { DUNGEON_EVENTS };
