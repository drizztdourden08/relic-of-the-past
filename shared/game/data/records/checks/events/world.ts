/* @layer shared-game @kind data */
/**
 * Held items that count as events, the fairies, the areas reached, and the combined
 * events. Numbers 200-299 of the events' id range.
 */
import type { CheckRecord, ItemId, Requirement } from '@shared/game/data/types';
import { EVENT_BIT as E } from './event-bits';
import { eventId, eventRecord } from './event-record';

const item = (n: number): ItemId => `item-${String(n).padStart(3, '0')}` as ItemId;
const VISITED = 0x0f;
const allOf = (ids: number[]): Requirement => ({ allOf: ids.map((n) => ({ checkId: eventId(n) })) });

const HELD_EVENTS: CheckRecord[] = [
  eventRecord({ n: 200, name: 'Pendant of Courage held', group: 'held', derived: { itemId: item(109) } }),
  eventRecord({ n: 201, name: 'Pendant of Power held', group: 'held', derived: { itemId: item(110) } }),
  eventRecord({ n: 202, name: 'Pendant of Wisdom held', group: 'held', derived: { itemId: item(111) } }),
  ...[1, 2, 3, 4, 5, 6, 7].map((n) => eventRecord({ n: 202 + n, name: `Crystal ${n} held`, group: 'held', derived: { itemId: item(111 + n) } })),
  eventRecord({ n: 210, name: 'Master Sword or better held', group: 'held', derived: { itemId: item(2) } }),
];

const FAIRY_EVENTS: CheckRecord[] = [
  eventRecord({ n: 220, name: 'Waterfall of Wishing entered', group: 'fairy', gameId: { roomId: 0x114, mask: VISITED } }),
  eventRecord({ n: 221, name: 'Capacity Upgrade Fairy entered', group: 'fairy', gameId: { roomId: 0x115, mask: 0x0a } }),
  eventRecord({ n: 222, name: 'Pyramid Fairy entered', group: 'fairy', gameId: { roomId: 0x116, mask: VISITED } }),
  eventRecord({ n: 223, name: 'North Fairy Cave entered', group: 'fairy', gameId: { roomId: 0x08, mask: VISITED } }),
  eventRecord({ n: 224, name: 'Long Fairy Cave entered', group: 'fairy', gameId: { roomId: 0x11e, mask: 0x0a } }),
  eventRecord({ n: 225, name: 'Hookshot Fairy entered', group: 'fairy', gameId: { roomId: 0x10c, mask: 0x05 } }),
  eventRecord({ n: 226, name: 'Lake Hylia Fairy entered', group: 'fairy', gameId: { eventBit: E.fairyLakeHylia } }),
  eventRecord({ n: 227, name: 'Swamp Fairy entered', group: 'fairy', gameId: { eventBit: E.fairySwamp } }),
  eventRecord({ n: 228, name: 'Desert Fairy entered', group: 'fairy', gameId: { eventBit: E.fairyDesert } }),
  eventRecord({ n: 229, name: 'Bonk Fairy entered (Light World)', group: 'fairy', gameId: { eventBit: E.fairyBonkLight } }),
  eventRecord({ n: 230, name: 'Bonk Fairy entered (Dark World)', group: 'fairy', gameId: { eventBit: E.fairyBonkDark } }),
  eventRecord({ n: 231, name: 'Dark Lake Hylia Fairy entered', group: 'fairy', gameId: { eventBit: E.fairyDarkLakeHylia } }),
  eventRecord({ n: 232, name: 'Dark Lake Hylia Ledge Fairy entered', group: 'fairy', gameId: { eventBit: E.fairyDarkLakeHyliaLedge } }),
  eventRecord({ n: 233, name: 'Dark Desert Fairy entered', group: 'fairy', gameId: { eventBit: E.fairyDarkDesert } }),
  eventRecord({ n: 234, name: 'Dark Death Mountain Fairy entered', group: 'fairy', gameId: { eventBit: E.fairyDarkDeathMountain } }),
];

const AREA_NAMES: [number, string][] = [
  [E.areaDeathMountain, 'Death Mountain'], [E.areaEastDeathMountain, 'East Death Mountain'], [E.areaMimicLedge, 'Mimic Cave ledge'],
  [E.areaDeathMountainEntrance, 'Death Mountain entrance'], [E.areaCastleGrounds, 'Hyrule Castle grounds'], [E.areaDesert, 'Desert'],
  [E.areaLakeHylia, 'Lake Hylia'], [E.areaPedestalMeadow, 'Master Sword Meadow'], [E.areaZorasDomain, "Zora's Domain"],
  [E.areaEastDarkWorld, 'East Dark World'], [E.areaNorthEastDarkWorld, 'Northeast Dark World'], [E.areaCatfish, 'Catfish'],
  [E.areaWestDarkWorld, 'West Dark World'], [E.areaSouthDarkWorld, 'South Dark World'], [E.areaDarkLakeHylia, 'Dark Lake Hylia'],
  [E.areaDarkDesert, 'Dark Desert'], [E.areaSkullWoods, 'Skull Woods forest'], [E.areaBumperCave, 'Bumper Cave'],
  [E.areaDarkDeathMountainWest, 'Dark Death Mountain west'], [E.areaDarkDeathMountainEast, 'Dark Death Mountain east'],
  [E.areaTurtleRockTop, 'Turtle Rock top'],
  [E.areaDeathMountainTop, 'Death Mountain top'], [E.areaEastDeathMountainTop, 'East Death Mountain top'],
  [E.areaLakeHyliaIsland, 'Lake Hylia central island'], [E.areaCastleTerrace, 'Hyrule Castle upper terrace'],
  [E.areaDesertPalaceStairs, 'Desert Palace stairs'], [E.areaDarkDeathMountainTop, 'Dark Death Mountain top'],
  [E.areaPyramidLedge, 'Pyramid ledge'], [E.areaDarkLakeHyliaIsland, 'Dark Lake Hylia island'],
];

const AREA_EVENTS: CheckRecord[] = AREA_NAMES.map(([bit, name], i) =>
  eventRecord({ n: 240 + i, name: `${name} reached`, group: 'area', gameId: { eventBit: bit } }));

const COMBINED_EVENTS: CheckRecord[] = [
  eventRecord({ n: 280, name: 'All pendants held', group: 'combined', derived: allOf([200, 201, 202]) }),
  eventRecord({ n: 281, name: 'All crystals held', group: 'combined', derived: allOf([203, 204, 205, 206, 207, 208, 209]) }),
  eventRecord({ n: 282, name: 'Crystals 5 and 6 held', group: 'combined', derived: allOf([207, 208]) }),
  eventRecord({ n: 283, name: 'All Light World dungeons cleared', group: 'combined', derived: allOf([68, 78, 88]) }),
  eventRecord({ n: 284, name: 'All Dark World dungeons cleared', group: 'combined', derived: allOf([108, 118, 128, 138, 148, 158, 168]) }),
  eventRecord({ n: 285, name: 'Ice Palace and Misery Mire cleared', group: 'combined', derived: allOf([148, 158]) }),
  eventRecord({ n: 286, name: 'Every dungeon cleared', group: 'combined', derived: allOf([68, 78, 88, 98, 108, 118, 128, 138, 148, 158, 168, 178, 182]) }),
  eventRecord({ n: 287, name: 'All bosses beaten', group: 'combined', derived: allOf([63, 73, 83, 93, 103, 113, 123, 133, 143, 153, 163, 173, 51]) }),
];

export { AREA_EVENTS, COMBINED_EVENTS, FAIRY_EVENTS, HELD_EVENTS };
