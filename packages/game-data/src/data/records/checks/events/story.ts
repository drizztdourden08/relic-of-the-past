/* @layer shared-game @kind data */
import type { CheckRecord, Requirement, ScreenId } from '../../../types';
import type { EventSpec } from '../../../checks/event-spec.type';
import { ITEM_GROUP_IDS } from '../../../item-groups';
import { canLiftHeavyRocks, canSeeInDarkRooms, hasBeamSword, hasFireSource, hasSword } from '../../../requirements/helpers';
import { EVENT_BIT as E } from './event-bits.generated';

const P = { indicator: 0, flags: 1, indicator3: 2, follower: 13, startPoint: 19, mapIcons: 20 } as const;

const UNCLE = { checkId: 'check-002' } as const;
const CASTLE_BIG_KEY: Requirement = { itemId: 'item-095' };
const SANCTUARY = { checkId: 'check-004' } as const;
const LAMP = canSeeInDarkRooms;
const HAMMER: Requirement = { itemId: 'item-010' };
const DARK_WORLD_REGIONS: readonly ScreenId[] = [
  'screen-252', 'screen-255', 'screen-260', 'screen-259', 'screen-240', 'screen-238', 'screen-257', 'screen-229', 'screen-237', 'screen-233',
];
const MIRROR_TOWER: Requirement = { allOf: [hasBeamSword, LAMP] };
const IN_CASTLE = { dungeonId: 'dungeon-001', subArea: '' } as const;
const IN_CASTLE_TOWER = { dungeonId: 'dungeon-002', subArea: '' } as const;
const IN_THIEVES_TOWN = { dungeonId: 'dungeon-009', subArea: '' } as const;
const IN_GANONS_TOWER = { dungeonId: 'dungeon-013', subArea: '' } as const;
const SILVER_ARROWS: Requirement = { anyOf: [{ itemId: 'item-060' }, { allOf: [{ itemId: 'item-012' }, { itemId: 'item-078' }] }] };

const STORY_EVENTS: EventSpec[] = [
  { n: 0, name: 'Uncle leaves the house', group: 'story', gameId: { bufferIndex: P.flags, mask: 0x10 } },
  { n: 2, name: "Zelda's cell unlocked", group: 'story', ...IN_CASTLE, gameId: { roomId: 0x80, mask: 0x20 }, requirements: { allOf: [UNCLE, CASTLE_BIG_KEY] } },
  { n: 3, name: 'Zelda freed', group: 'story', ...IN_CASTLE, gameId: { eventBit: E.zeldaFreed }, now: { followerEq: 1 }, requirements: { checkId: 'check-302' } },
  { n: 6, name: 'Intro complete', group: 'story', ...IN_CASTLE, derived: SANCTUARY },
  { n: 7, name: "Kakariko kid's hint", group: 'story', gameId: { bufferIndex: P.mapIcons, compare: 'gte', value: 2 }, requirements: SANCTUARY },
  { n: 8, name: "Sahasrahla's quest", group: 'story', gameId: { eventBit: E.sahasrahlaMapHint }, requirements: SANCTUARY },
  { n: 9, name: 'Sahasrahla marks the map', group: 'story', gameId: { bufferIndex: P.mapIcons, compare: 'gte', value: 3 }, requirements: { checkId: 'check-308' } },
  { n: 10, name: "Sahasrahla's trial passed", group: 'story', gameId: { eventBit: E.sahasrahlaGift }, requirements: { itemId: 'item-056' } },
  { n: 11, name: 'Talked to Aginah', group: 'story', gameId: { eventBit: E.aginahTalked }, requirements: SANCTUARY },
  { n: 12, name: 'Master Sword pulled', group: 'story', gameId: { owScreen: 0x80, mask: 0x40 },
    requirements: { count: { groupId: ITEM_GROUP_IDS.Pendants, n: 3 } } },
  { n: 13, name: "Loyal Sage's last words", group: 'story', ...IN_CASTLE, gameId: { bufferIndex: P.flags, mask: 0x02 }, requirements: { checkId: 'check-312' } },
  { n: 14, name: 'Castle barrier broken', group: 'story', gameId: { owScreen: 0x1b, mask: 0x40 }, requirements: hasBeamSword },
  { n: 15, name: 'Old Man found', group: 'story', gameId: { eventBit: E.followerOldMan }, now: { followerEq: 4 } },
  { n: 16, name: 'Old Man rescued', group: 'story', gameId: { eventBit: E.oldManRescued }, requirements: { checkId: 'check-315' } },
  { n: 17, name: "Hobo's bottle", group: 'story', gameId: { bufferIndex: P.indicator3, mask: 0x01 }, requirements: { itemId: 'item-031' } },
  { n: 18, name: 'Bottle bought from the merchant', group: 'story', gameId: { bufferIndex: P.indicator3, mask: 0x02 }, requirements: SANCTUARY },
  { n: 19, name: "Witch's powder ready", group: 'story', gameId: { roomId: 0x109, mask: 0x80 }, requirements: { itemId: 'item-042' } },
  { n: 20, name: "Witch's brew collected", group: 'story', gameId: { eventBit: E.powderBag }, requirements: { checkId: 'check-319' } },
  { n: 21, name: 'Magic Bat summoned', group: 'story', gameId: { eventBit: E.magicBat }, requirements: { itemId: 'item-014' } },
  { n: 22, name: 'Tempering paid', group: 'story', gameId: { eventBit: E.temperingPaid },
    now: { progressIndicator3: 0x80, state: 'set' }, requirements: { checkId: 'check-336' } },
  { n: 23, name: 'Tempering done', group: 'story', gameId: { eventBit: E.temperedSwordCollected }, requirements: { checkId: 'check-322' } },
  { n: 24, name: 'Weathervane opened', group: 'story', gameId: { owScreen: 0x18, mask: 0x20 },
    requirements: { allOf: [SANCTUARY, { anyOf: [{ itemId: 'item-021' }, { itemId: 'item-075' }] }] } },
  { n: 25, name: "King's Tomb opened", group: 'story', gameId: { owScreen: 0x14, mask: 0x20 }, requirements: { itemId: 'item-076' } },
  { n: 26, name: 'Floodgate lever pulled', group: 'story', gameId: { eventBit: E.floodgatePulled },
    now: { owEvent: { screen: 0x3b, mask: 0x20 }, state: 'set' } },
  { n: 27, name: 'Death Mountain warp pegs', group: 'story', gameId: { owScreen: 0x07, mask: 0x20 },
    requirements: { allOf: [HAMMER, canLiftHeavyRocks] } },
  { n: 28, name: 'Agahnim sends Zelda away', group: 'story', ...IN_CASTLE_TOWER, gameId: { eventBit: E.agahnimAltar }, requirements: MIRROR_TOWER },
  { n: 29, name: 'Agahnim 1 beaten', group: 'story', ...IN_CASTLE_TOWER, gameId: { bufferIndex: P.indicator, compare: 'gte', value: 3 }, requirements: { allOf: [hasSword, LAMP] } },
  { n: 30, name: 'Dark World reached', group: 'story', gameId: { eventBit: E.firstDarkWorld }, reachAny: DARK_WORLD_REGIONS, now: { darkWorld: true } },
  { n: 31, name: 'Kiki hired', group: 'story', gameId: { eventBit: E.followerKiki }, now: { followerEq: 10 } },
  { n: 32, name: 'Palace of Darkness opened', group: 'story', gameId: { owScreen: 0x5e, mask: 0x20 }, requirements: { checkId: 'check-331' } },
  { n: 33, name: "Thieves' Town opened", group: 'story', gameId: { owScreen: 0x58, mask: 0x20 }, requirements: { itemId: 'item-032' } },
  { n: 34, name: 'Hammer peg field cleared', group: 'story', gameId: { owScreen: 0x62, mask: 0x20 }, requirements: HAMMER },
  { n: 35, name: 'Frog found', group: 'story', actorId: 'actor-003',
    gameId: { eventBit: E.followerFrog, flagType: 2, flagMask: 0x20, itemId: 255, spriteType: 26, postGfx: 0 },
    now: { followerEq: 7 }, requirements: { itemId: 'item-029' } },
  { n: 36, name: 'Smiths reunited', group: 'story',
    gameId: { bufferIndex: P.indicator3, mask: 0x20, flagType: 2, flagMask: 0x20, itemId: 255, spriteType: 255, postGfx: 0 },
    requirements: { checkId: 'check-335' } },
  { n: 37, name: 'Purple Chest found', group: 'story', gameId: { eventBit: E.followerPurpleChest },
    now: { followerEq: 12 }, requirements: { checkId: 'check-336' } },
  { n: 38, name: 'Purple Chest opened', group: 'story', gameId: { bufferIndex: P.indicator3, mask: 0x10 }, requirements: { checkId: 'check-337' } },
  { n: 39, name: 'Flute boy asks for his flute', group: 'story', gameId: { eventBit: E.shovelFromStump } },
  { n: 40, name: 'Stumpy at rest', group: 'story', gameId: { bufferIndex: P.indicator3, mask: 0x08 },
    requirements: { anyOf: [{ itemId: 'item-021' }, { itemId: 'item-075' }] } },
  { n: 41, name: 'Big Bomb bought', group: 'story', gameId: { eventBit: E.followerBigBomb }, now: { followerEq: 13 },
    requirements: { allOf: [{ itemId: 'item-116' }, { itemId: 'item-117' }] } },
  { n: 42, name: 'Pyramid Fairy wall blown up', group: 'story', gameId: { owScreen: 0x5b, mask: 0x02 }, requirements: { checkId: 'check-341' } },
  { n: 43, name: 'Skull Woods back entrance burned', group: 'story', gameId: { owScreen: 0x40, mask: 0x20 }, requirements: { itemId: 'item-008' } },
  { n: 44, name: 'Misery Mire opened', group: 'story', gameId: { owScreen: 0x70, mask: 0x20 },
    requirements: { allOf: [{ itemId: 'item-032' }, { itemId: 'item-017' }, hasSword] } },
  { n: 45, name: 'Turtle Rock opened', group: 'story', gameId: { owScreen: 0x47, mask: 0x20 },
    requirements: { allOf: [{ itemId: 'item-032' }, { itemId: 'item-018' }, hasSword] } },
  { n: 46, name: 'Maiden freed', group: 'story', ...IN_THIEVES_TOWN, gameId: { eventBit: E.followerMaiden }, now: { followerEq: 6 }, requirements: { itemId: 'item-086' } },
  { n: 47, name: 'Blind revealed', group: 'story', ...IN_THIEVES_TOWN, gameId: { roomId: 0xac, mask: 0x200 }, requirements: { checkId: 'check-346' } },
  { n: 48, name: "Ganon's Tower opened", group: 'story', gameId: { owScreen: 0x43, mask: 0x20 },
    requirements: { count: { groupId: ITEM_GROUP_IDS.Crystals, n: 7 } } },
  { n: 49, name: 'Agahnim 2 beaten', group: 'story', ...IN_GANONS_TOWER, gameId: { roomId: 0x0d, mask: 0x800 },
    requirements: { allOf: [hasSword, { itemId: 'item-011' }, { itemId: 'item-012' }, hasFireSource, HAMMER, { itemId: 'item-022' }] } },
  { n: 50, name: 'Pyramid hole opened', group: 'story', gameId: { owScreen: 0x5b, mask: 0x20 }, requirements: { checkId: 'check-349' } },
  { n: 51, name: 'Ganon beaten', group: 'story', gameId: { eventBit: E.ganonBeaten },
    requirements: { allOf: [{ checkId: 'check-350' }, hasBeamSword, hasFireSource, SILVER_ARROWS] } },
  { n: 52, name: 'Game completed', group: 'story', gameId: { eventBit: E.gameCompleted }, requirements: { checkId: 'check-351' } },
  { n: 53, name: 'Desert statues prayed open', group: 'story', gameId: { eventBit: E.desertPrayer },
    now: { desertStatuesMoved: true }, requirements: { itemId: 'item-030' } },
  { n: 54, name: 'Kakariko guards on alert', group: 'status', gameId: { bufferIndex: P.indicator, compare: 'gte', value: 2 },
    now: { progressIndicatorEq: 2 }, requirements: SANCTUARY },
  { n: 55, name: 'Raining', group: 'status', now: { progressIndicatorLt: 2 }, statusOnly: true },
  { n: 56, name: 'Bunny form', group: 'status', now: { bunny: true }, statusOnly: true },
  { n: 57, name: 'Crystal switch flipped', group: 'status', now: { crystalSwitchFlipped: true }, statusOnly: true },
];

const EARLY_STORY_EVENTS: CheckRecord[] = [
  {
    id: 'check-001',
    gameId: { bufferIndex: 12, compare: 'gte', value: 2 },
    kind: 'event',
    screenId: 'screen-205',
    regionId: 'region-064',
    name: 'Link Wakes Up',
    vanillaItemIds: [],
  },
  {
    id: 'check-002',
    gameId: { bufferIndex: 0, compare: 'gte', value: 1 },
    kind: 'event',
    screenId: 'screen-171',
    regionId: 'region-059',
    name: 'Uncle found wounded',
    vanillaItemIds: [],
  },
  {
    id: 'check-003',
    gameId: { eventBit: 42 },
    kind: 'event',
    screenId: 'screen-119',
    regionId: 'region-169',
    ...IN_CASTLE,
    name: 'Throne Room Shelf Moved',
    vanillaItemIds: [],
    requirements: { checkId: 'check-303' },
  },
  {
    id: 'check-004',
    gameId: { bufferIndex: 0, compare: 'gte', value: 2 },
    kind: 'event',
    screenId: 'screen-103',
    regionId: 'region-174',
    ...IN_CASTLE,
    name: 'Rescued Zelda',
    vanillaItemIds: [],
  },
  {
    id: 'check-005',
    gameId: { bufferIndex: 20, compare: 'gte', value: 3 },
    kind: 'event',
    screenId: 'screen-209',
    regionId: 'region-088',
    name: 'Sahasrahla Quest Given',
    vanillaItemIds: [],
  },
];

export { EARLY_STORY_EVENTS, STORY_EVENTS };
