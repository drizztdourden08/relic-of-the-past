/* @layer shared-game @kind data */
/**
 * Held items that count as events, the fairies, the areas reached, and the combined
 * events. Numbers 200-307 of the events' id range.
 */
import type { CheckRecord, ItemId, Requirement } from '@shared/game/data/types';
import { EVENT_BIT as E } from './event-bits';
import { eventId, eventRecord } from './event-record';

const item = (n: number): ItemId => `item-${String(n).padStart(3, '0')}` as ItemId;
const VISITED = 0x0f;
const allOf = (ids: number[]): Requirement => ({ allOf: ids.map((n) => ({ checkId: eventId(n) })) });

const HELD_EVENTS: CheckRecord[] = [
  eventRecord({ n: 200, name: 'Pendant of Courage held', group: 'held', derived: { itemId: item(56) } }),
  eventRecord({ n: 201, name: 'Pendant of Power held', group: 'held', derived: { itemId: item(58) } }),
  eventRecord({ n: 202, name: 'Pendant of Wisdom held', group: 'held', derived: { itemId: item(57) } }),
  eventRecord({ n: 203, name: 'Crystal 1 held', group: 'held', derived: { itemId: item(112) } }),
  eventRecord({ n: 204, name: 'Crystal 2 held', group: 'held', derived: { itemId: item(113) } }),
  eventRecord({ n: 205, name: 'Crystal 3 held', group: 'held', derived: { itemId: item(114) } }),
  eventRecord({ n: 206, name: 'Crystal 4 held', group: 'held', derived: { itemId: item(115) } }),
  eventRecord({ n: 207, name: 'Crystal 5 held', group: 'held', derived: { itemId: item(116) } }),
  eventRecord({ n: 208, name: 'Crystal 6 held', group: 'held', derived: { itemId: item(117) } }),
  eventRecord({ n: 209, name: 'Crystal 7 held', group: 'held', derived: { itemId: item(118) } }),
  eventRecord({ n: 210, name: 'Master Sword or better held', group: 'held', derived: { itemId: item(2) } }),
  // The game keeps only the bomb count; the ledger keeps that a bomb was ever held.
  eventRecord({ n: 211, name: 'First bombs held', group: 'held', gameId: { eventBit: E.bombsFirstHeld } }),
];

const FAIRY_EVENTS: CheckRecord[] = [
  eventRecord({ n: 220, name: 'Waterfall Fairy entered', group: 'fairy', gameId: { roomId: 0x114, mask: VISITED } }),
  eventRecord({ n: 221, name: 'Hylia Fairy entered', group: 'fairy', gameId: { roomId: 0x115, mask: 0x0a } }),
  eventRecord({ n: 222, name: 'Pyramid Fairy entered', group: 'fairy', gameId: { roomId: 0x116, mask: VISITED } }),
  eventRecord({ n: 223, name: 'North Fairy Cave entered', group: 'fairy', gameId: { roomId: 0x08, mask: VISITED } }),
  eventRecord({ n: 224, name: 'Long Fairy Cave entered', group: 'fairy', gameId: { roomId: 0x11e, mask: 0x0a } }),
  // Room 0x10C is shared with the Mimic Cave. This cave is its east column, two quarters tall, and
  // the game marks both quarters (0x0A) the moment the player walks in, because the room scrolls
  // as one. So the word says the cave was entered and nothing more; the far side of its water, a
  // Hookshot shot away, is recorded by the core from where the player stands (event_watch.c).
  eventRecord({ n: 225, name: 'Hookshot Fairy Cave entered', group: 'fairy', gameId: { roomId: 0x10c, mask: 0x0a } }),
  eventRecord({ n: 235, name: 'Hookshot Fairy Cave far side reached', group: 'fairy', gameId: { eventBit: E.hookshotFairyFarSide },
    requirements: { itemId: item(11) } }),
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

/**
 * Every open region the core records as reached. Two of them are a pocket behind a rock on a
 * screen anyone can walk onto, so standing on the screen says nothing: each of those is read
 * from the cave the pocket leads into instead.
 */
const AREA_EVENTS: CheckRecord[] = [
  eventRecord({ n: 240, name: 'Death Mountain reached', group: 'area', gameId: { eventBit: E.areaDeathMountain } }),
  eventRecord({ n: 241, name: 'East Death Mountain reached', group: 'area', gameId: { eventBit: E.areaEastDeathMountain } }),
  eventRecord({ n: 242, name: 'Mimic Cave ledge reached', group: 'area', gameId: { eventBit: E.areaMimicLedge } }),
  eventRecord({ n: 243, name: 'Death Mountain entrance reached', group: 'area', gameId: { roomId: 0xf0, mask: VISITED } }),
  eventRecord({ n: 244, name: 'Hyrule Castle grounds reached', group: 'area', gameId: { eventBit: E.areaCastleGrounds } }),
  eventRecord({ n: 245, name: 'Desert reached', group: 'area', gameId: { eventBit: E.areaDesert } }),
  eventRecord({ n: 246, name: 'Lake Hylia reached', group: 'area', gameId: { eventBit: E.areaLakeHylia } }),
  eventRecord({ n: 247, name: 'Master Sword Meadow reached', group: 'area', gameId: { eventBit: E.areaPedestalMeadow } }),
  eventRecord({ n: 248, name: "Zora's Domain reached", group: 'area', gameId: { eventBit: E.areaZorasDomain } }),
  eventRecord({ n: 249, name: 'East Dark World reached', group: 'area', gameId: { eventBit: E.areaEastDarkWorld } }),
  eventRecord({ n: 250, name: 'Northeast Dark World reached', group: 'area', gameId: { eventBit: E.areaNorthEastDarkWorld } }),
  eventRecord({ n: 251, name: 'Catfish reached', group: 'area', gameId: { eventBit: E.areaCatfish } }),
  eventRecord({ n: 252, name: 'West Dark World reached', group: 'area', gameId: { eventBit: E.areaWestDarkWorld } }),
  eventRecord({ n: 253, name: 'South Dark World reached', group: 'area', gameId: { eventBit: E.areaSouthDarkWorld } }),
  eventRecord({ n: 254, name: 'Dark Lake Hylia reached', group: 'area', gameId: { eventBit: E.areaDarkLakeHylia } }),
  eventRecord({ n: 255, name: 'Dark Desert reached', group: 'area', gameId: { eventBit: E.areaDarkDesert } }),
  eventRecord({ n: 256, name: 'Skull Woods forest reached', group: 'area', gameId: { eventBit: E.areaSkullWoods } }),
  eventRecord({ n: 257, name: 'Bumper Cave reached', group: 'area', gameId: { roomId: 0xfb, mask: VISITED } }),
  eventRecord({ n: 258, name: 'Dark Death Mountain west reached', group: 'area', gameId: { eventBit: E.areaDarkDeathMountainWest } }),
  eventRecord({ n: 259, name: 'Dark Death Mountain east reached', group: 'area', gameId: { eventBit: E.areaDarkDeathMountainEast } }),
  eventRecord({ n: 260, name: 'Turtle Rock top reached', group: 'area', gameId: { eventBit: E.areaTurtleRockTop } }),
  eventRecord({ n: 261, name: 'Death Mountain top reached', group: 'area', gameId: { eventBit: E.areaDeathMountainTop } }),
  eventRecord({ n: 262, name: 'East Death Mountain top reached', group: 'area', gameId: { eventBit: E.areaEastDeathMountainTop } }),
  eventRecord({ n: 263, name: 'Lake Hylia fairy island reached', group: 'area', gameId: { eventBit: E.areaLakeHyliaIsland } }),
  eventRecord({ n: 264, name: 'Hyrule Castle upper terrace reached', group: 'area', gameId: { eventBit: E.areaCastleTerrace } }),
  eventRecord({ n: 265, name: 'Desert Palace stairs reached', group: 'area', gameId: { eventBit: E.areaDesertPalaceStairs } }),
  eventRecord({ n: 266, name: 'Dark Death Mountain top reached', group: 'area', gameId: { eventBit: E.areaDarkDeathMountainTop } }),
  eventRecord({ n: 267, name: 'Pyramid ledge reached', group: 'area', gameId: { eventBit: E.areaPyramidLedge } }),
  eventRecord({ n: 268, name: 'Dark Lake Hylia island reached', group: 'area', gameId: { eventBit: E.areaDarkLakeHyliaIsland } }),
];

/**
 * Named places inside the open regions. Their own number block, because 269 to 279 would run
 * into the combined rows. 'Path to Zora' is the screen east of the Witch, in front of the rock:
 * open country. Zora's Domain itself is the row that asks for the flippers or a glove.
 */
const PLACE_EVENTS: CheckRecord[] = [
  eventRecord({ n: 290, name: 'Lost Woods reached', group: 'area', gameId: { eventBit: E.areaLostWoods } }),
  eventRecord({ n: 291, name: "Lumberjacks' house reached", group: 'area', gameId: { eventBit: E.areaLumberjacks } }),
  eventRecord({ n: 292, name: 'Kakariko Village reached', group: 'area', gameId: { eventBit: E.areaKakariko } }),
  eventRecord({ n: 293, name: 'Sanctuary grounds reached', group: 'area', gameId: { eventBit: E.areaSanctuaryGrounds } }),
  eventRecord({ n: 294, name: 'Graveyard reached', group: 'area', gameId: { eventBit: E.areaGraveyard } }),
  eventRecord({ n: 295, name: "Witch's hut reached", group: 'area', gameId: { eventBit: E.areaWitchsHut } }),
  eventRecord({ n: 296, name: 'Path to Zora reached', group: 'area', gameId: { eventBit: E.areaZorasRiver } }),
  eventRecord({ n: 297, name: 'Eastern Palace grounds reached', group: 'area', gameId: { eventBit: E.areaEasternPalaceGrounds } }),
  eventRecord({ n: 298, name: "Uncle's Estate reached", group: 'area', gameId: { eventBit: E.areaUnclesEstate } }),
  eventRecord({ n: 299, name: 'Haunted Grove reached', group: 'area', gameId: { eventBit: E.areaHauntedGrove } }),
  eventRecord({ n: 300, name: 'Great Swamp reached', group: 'area', gameId: { eventBit: E.areaGreatSwamp } }),
  eventRecord({ n: 301, name: 'Village of Outcasts reached', group: 'area', gameId: { eventBit: E.areaVillageOfOutcasts } }),
  eventRecord({ n: 302, name: 'Palace of Darkness grounds reached', group: 'area', gameId: { eventBit: E.areaPalaceOfDarknessGrounds } }),
  eventRecord({ n: 303, name: 'Swamp Palace grounds reached', group: 'area', gameId: { eventBit: E.areaSwampPalaceGrounds } }),
  eventRecord({ n: 304, name: 'Dark Sanctuary grounds reached', group: 'area', gameId: { eventBit: E.areaDarkSanctuaryGrounds } }),
  eventRecord({ n: 305, name: 'Bomb Shop grounds reached', group: 'area', gameId: { eventBit: E.areaBombShopGrounds } }),
  eventRecord({ n: 306, name: 'Lake Hylia heart piece island reached', group: 'area', gameId: { eventBit: E.areaLakeHyliaLedgeIsland } }),
  eventRecord({ n: 307, name: 'Bumper Cave ledge reached', group: 'area', gameId: { eventBit: E.areaBumperCaveLedge } }),
];

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

export { AREA_EVENTS, COMBINED_EVENTS, FAIRY_EVENTS, HELD_EVENTS, PLACE_EVENTS };
