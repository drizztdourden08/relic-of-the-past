/* @layer shared-game @kind data */
import type { EventSpec } from '../../../checks/event-spec.type';
import { EVENT_BIT as E } from './event-bits.constants';

const VISITED = 0x0f;

const HELD_EVENTS: EventSpec[] = [
  { n: 200, name: 'Pendant of Courage held', group: 'held', derived: { itemId: 'item-056' } },
  { n: 201, name: 'Pendant of Power held', group: 'held', derived: { itemId: 'item-058' } },
  { n: 202, name: 'Pendant of Wisdom held', group: 'held', derived: { itemId: 'item-057' } },
  { n: 203, name: 'Crystal 1 held', group: 'held', derived: { itemId: 'item-112' } },
  { n: 204, name: 'Crystal 2 held', group: 'held', derived: { itemId: 'item-113' } },
  { n: 205, name: 'Crystal 3 held', group: 'held', derived: { itemId: 'item-114' } },
  { n: 206, name: 'Crystal 4 held', group: 'held', derived: { itemId: 'item-115' } },
  { n: 207, name: 'Crystal 5 held', group: 'held', derived: { itemId: 'item-116' } },
  { n: 208, name: 'Crystal 6 held', group: 'held', derived: { itemId: 'item-117' } },
  { n: 209, name: 'Crystal 7 held', group: 'held', derived: { itemId: 'item-118' } },
  { n: 210, name: 'Master Sword or better held', group: 'held', derived: { itemId: 'item-002' } },
  { n: 211, name: 'First bombs held', group: 'held', gameId: { eventBit: E.bombsFirstHeld } },
];

const FAIRY_EVENTS: EventSpec[] = [
  { n: 220, name: 'Waterfall Fairy entered', group: 'fairy', gameId: { roomId: 0x114, mask: VISITED } },
  { n: 221, name: 'Hylia Fairy entered', group: 'fairy', gameId: { roomId: 0x115, mask: 0x0a } },
  { n: 222, name: 'Pyramid Fairy entered', group: 'fairy', gameId: { roomId: 0x116, mask: VISITED } },
  { n: 223, name: 'North Fairy Cave entered', group: 'fairy', gameId: { roomId: 0x08, mask: VISITED } },
  { n: 224, name: 'Long Fairy Cave entered', group: 'fairy', gameId: { roomId: 0x11e, mask: 0x0a } },
  { n: 225, name: 'Hookshot Fairy Cave entered', group: 'fairy', gameId: { roomId: 0x10c, mask: 0x0a } },
  { n: 235, name: 'Hookshot Fairy Cave far side reached', group: 'fairy', gameId: { eventBit: E.hookshotFairyFarSide },
    requirements: { itemId: 'item-011' } },
  { n: 226, name: 'Lake Hylia Fairy entered', group: 'fairy', gameId: { eventBit: E.fairyLakeHylia } },
  { n: 227, name: 'Swamp Fairy entered', group: 'fairy', gameId: { eventBit: E.fairySwamp } },
  { n: 228, name: 'Desert Fairy entered', group: 'fairy', gameId: { eventBit: E.fairyDesert } },
  { n: 229, name: 'Bonk Fairy entered (Light World)', group: 'fairy', gameId: { eventBit: E.fairyBonkLight } },
  { n: 230, name: 'Bonk Fairy entered (Dark World)', group: 'fairy', gameId: { eventBit: E.fairyBonkDark } },
  { n: 231, name: 'Dark Lake Hylia Fairy entered', group: 'fairy', gameId: { eventBit: E.fairyDarkLakeHylia } },
  { n: 232, name: 'Dark Lake Hylia Ledge Fairy entered', group: 'fairy', gameId: { eventBit: E.fairyDarkLakeHyliaLedge } },
  { n: 233, name: 'Dark Desert Fairy entered', group: 'fairy', gameId: { eventBit: E.fairyDarkDesert } },
  { n: 234, name: 'Dark Death Mountain Fairy entered', group: 'fairy', gameId: { eventBit: E.fairyDarkDeathMountain } },
];

const AREA_EVENTS: EventSpec[] = [
  { n: 240, name: 'Death Mountain reached', group: 'area', gameId: { eventBit: E.areaDeathMountain } },
  { n: 241, name: 'East Death Mountain reached', group: 'area', gameId: { eventBit: E.areaEastDeathMountain } },
  { n: 242, name: 'Mimic Cave ledge reached', group: 'area', gameId: { eventBit: E.areaMimicLedge } },
  { n: 243, name: 'Death Mountain entrance reached', group: 'area', gameId: { roomId: 0xf0, mask: VISITED } },
  { n: 244, name: 'Hyrule Castle grounds reached', group: 'area', gameId: { eventBit: E.areaCastleGrounds } },
  { n: 245, name: 'Desert reached', group: 'area', gameId: { eventBit: E.areaDesert } },
  { n: 246, name: 'Lake Hylia reached', group: 'area', gameId: { eventBit: E.areaLakeHylia } },
  { n: 247, name: 'Master Sword Meadow reached', group: 'area', gameId: { eventBit: E.areaPedestalMeadow } },
  { n: 248, name: "Zora's Domain reached", group: 'area', gameId: { eventBit: E.areaZorasDomain } },
  { n: 249, name: 'East Dark World reached', group: 'area', gameId: { eventBit: E.areaEastDarkWorld } },
  { n: 250, name: 'Northeast Dark World reached', group: 'area', gameId: { eventBit: E.areaNorthEastDarkWorld } },
  { n: 251, name: 'Catfish reached', group: 'area', gameId: { eventBit: E.areaCatfish } },
  { n: 252, name: 'West Dark World reached', group: 'area', gameId: { eventBit: E.areaWestDarkWorld } },
  { n: 253, name: 'South Dark World reached', group: 'area', gameId: { eventBit: E.areaSouthDarkWorld } },
  { n: 254, name: 'Dark Lake Hylia reached', group: 'area', gameId: { eventBit: E.areaDarkLakeHylia } },
  { n: 255, name: 'Dark Desert reached', group: 'area', gameId: { eventBit: E.areaDarkDesert } },
  { n: 256, name: 'Skull Woods forest reached', group: 'area', gameId: { eventBit: E.areaSkullWoods } },
  { n: 257, name: 'Bumper Cave reached', group: 'area', gameId: { roomId: 0xfb, mask: VISITED } },
  { n: 258, name: 'Dark Death Mountain west reached', group: 'area', gameId: { eventBit: E.areaDarkDeathMountainWest } },
  { n: 259, name: 'Dark Death Mountain east reached', group: 'area', gameId: { eventBit: E.areaDarkDeathMountainEast } },
  { n: 260, name: 'Turtle Rock top reached', group: 'area', gameId: { eventBit: E.areaTurtleRockTop } },
  { n: 261, name: 'Death Mountain top reached', group: 'area', gameId: { eventBit: E.areaDeathMountainTop } },
  { n: 262, name: 'East Death Mountain top reached', group: 'area', gameId: { eventBit: E.areaEastDeathMountainTop } },
  { n: 263, name: 'Lake Hylia fairy island reached', group: 'area', gameId: { eventBit: E.areaLakeHyliaIsland } },
  { n: 264, name: 'Hyrule Castle upper terrace reached', group: 'area', gameId: { eventBit: E.areaCastleTerrace } },
  { n: 265, name: 'Desert Palace stairs reached', group: 'area', gameId: { eventBit: E.areaDesertPalaceStairs } },
  { n: 266, name: 'Dark Death Mountain top reached', group: 'area', gameId: { eventBit: E.areaDarkDeathMountainTop } },
  { n: 267, name: 'Pyramid ledge reached', group: 'area', gameId: { eventBit: E.areaPyramidLedge } },
  { n: 268, name: 'Dark Lake Hylia island reached', group: 'area', gameId: { eventBit: E.areaDarkLakeHyliaIsland } },
];

const PLACE_EVENTS: EventSpec[] = [
  { n: 290, name: 'Lost Woods reached', group: 'area', gameId: { eventBit: E.areaLostWoods } },
  { n: 291, name: "Lumberjacks' house reached", group: 'area', gameId: { eventBit: E.areaLumberjacks } },
  { n: 292, name: 'Kakariko Village reached', group: 'area', gameId: { eventBit: E.areaKakariko } },
  { n: 293, name: 'Sanctuary grounds reached', group: 'area', gameId: { eventBit: E.areaSanctuaryGrounds } },
  { n: 294, name: 'Graveyard reached', group: 'area', gameId: { eventBit: E.areaGraveyard } },
  { n: 295, name: "Witch's hut reached", group: 'area', gameId: { eventBit: E.areaWitchsHut } },
  { n: 296, name: 'Path to Zora reached', group: 'area', gameId: { eventBit: E.areaZorasRiver } },
  { n: 297, name: 'Eastern Palace grounds reached', group: 'area', gameId: { eventBit: E.areaEasternPalaceGrounds } },
  { n: 298, name: "Uncle's Estate reached", group: 'area', gameId: { eventBit: E.areaUnclesEstate } },
  { n: 299, name: 'Haunted Grove reached', group: 'area', gameId: { eventBit: E.areaHauntedGrove } },
  { n: 300, name: 'Great Swamp reached', group: 'area', gameId: { eventBit: E.areaGreatSwamp } },
  { n: 301, name: 'Village of Outcasts reached', group: 'area', gameId: { eventBit: E.areaVillageOfOutcasts } },
  { n: 302, name: 'Palace of Darkness grounds reached', group: 'area', gameId: { eventBit: E.areaPalaceOfDarknessGrounds } },
  { n: 303, name: 'Swamp Palace grounds reached', group: 'area', gameId: { eventBit: E.areaSwampPalaceGrounds } },
  { n: 304, name: 'Dark Sanctuary grounds reached', group: 'area', gameId: { eventBit: E.areaDarkSanctuaryGrounds } },
  { n: 305, name: 'Bomb Shop grounds reached', group: 'area', gameId: { eventBit: E.areaBombShopGrounds } },
  { n: 306, name: 'Lake Hylia heart piece island reached', group: 'area', gameId: { eventBit: E.areaLakeHyliaLedgeIsland } },
  { n: 307, name: 'Bumper Cave ledge reached', group: 'area', gameId: { eventBit: E.areaBumperCaveLedge } },
];

const COMBINED_EVENTS: EventSpec[] = [
  { n: 280, name: 'All pendants held', group: 'combined',
    derived: { allOf: [{ checkId: 'check-500' }, { checkId: 'check-501' }, { checkId: 'check-502' }] } },
  { n: 281, name: 'All crystals held', group: 'combined',
    derived: { allOf: [
      { checkId: 'check-503' }, { checkId: 'check-504' }, { checkId: 'check-505' }, { checkId: 'check-506' },
      { checkId: 'check-507' }, { checkId: 'check-508' }, { checkId: 'check-509' },
    ] } },
  { n: 282, name: 'Crystals 5 and 6 held', group: 'combined',
    derived: { allOf: [{ checkId: 'check-507' }, { checkId: 'check-508' }] } },
  { n: 283, name: 'All Light World dungeons cleared', group: 'combined',
    derived: { allOf: [{ checkId: 'check-368' }, { checkId: 'check-378' }, { checkId: 'check-388' }] } },
  { n: 284, name: 'All Dark World dungeons cleared', group: 'combined',
    derived: { allOf: [
      { checkId: 'check-408' }, { checkId: 'check-418' }, { checkId: 'check-428' }, { checkId: 'check-438' },
      { checkId: 'check-448' }, { checkId: 'check-458' }, { checkId: 'check-468' },
    ] } },
  { n: 285, name: 'Ice Palace and Misery Mire cleared', group: 'combined',
    derived: { allOf: [{ checkId: 'check-448' }, { checkId: 'check-458' }] } },
  { n: 286, name: 'Every dungeon cleared', group: 'combined',
    derived: { allOf: [
      { checkId: 'check-368' }, { checkId: 'check-378' }, { checkId: 'check-388' }, { checkId: 'check-398' },
      { checkId: 'check-408' }, { checkId: 'check-418' }, { checkId: 'check-428' }, { checkId: 'check-438' },
      { checkId: 'check-448' }, { checkId: 'check-458' }, { checkId: 'check-468' }, { checkId: 'check-478' },
      { checkId: 'check-482' },
    ] } },
  { n: 287, name: 'All bosses beaten', group: 'combined',
    derived: { allOf: [
      { checkId: 'check-363' }, { checkId: 'check-373' }, { checkId: 'check-383' }, { checkId: 'check-393' },
      { checkId: 'check-403' }, { checkId: 'check-413' }, { checkId: 'check-423' }, { checkId: 'check-433' },
      { checkId: 'check-443' }, { checkId: 'check-453' }, { checkId: 'check-463' }, { checkId: 'check-473' },
      { checkId: 'check-351' },
    ] } },
];

export { AREA_EVENTS, COMBINED_EVENTS, FAIRY_EVENTS, HELD_EVENTS, PLACE_EVENTS };
