/* @layer shared-game @kind data */
/**
 * Story events: the moments the game records in the battery block, read where they are, and
 * the ones it forgets, read from the ledger. Numbers 0-59 of the events' id range. Each carries
 * what it asks for in items and earlier checks, so the tracker's logic can say whether it is
 * within reach; the screen it lists under comes from event-screens.data.ts.
 *
 * Three moments the tracker already had records for stay where they are and are not repeated
 * here: the uncle's gift (check-002), the throne room shelf (check-003) and Zelda reaching the
 * Sanctuary (check-004). Numbers 1, 4 and 5 are left unused so the others keep their ids.
 */
import type { CheckId, CheckRecord, ItemId, Requirement } from '@shared/game/data/types';
import { ITEM_GROUP_IDS } from '@shared/game/data/item-groups';
import { canLiftRocks, hasBeamSword, hasCrystals, hasFireSource, hasSword } from '@shared/game/data/requirements/helpers';
import { EVENT_BIT as E } from './event-bits';
import { eventRecord } from './event-record';

/** Progress-buffer slots (core/game-hooks/state_queries_progress.c). */
const P = { indicator: 0, flags: 1, indicator3: 2, follower: 13, startPoint: 19, mapIcons: 20 } as const;

const UNCLE = { checkId: 'check-002' } as const;
const SANCTUARY = { checkId: 'check-004' } as const;
const item = (id: string): Requirement => ({ itemId: id as ItemId });
/** An earlier event of this list, by its number. */
const after = (n: number): Requirement => ({ checkId: `check-${300 + n}` as CheckId });
const LAMP = item('item-019');
const HAMMER = item('item-010');
const MIRROR_TOWER: Requirement = { allOf: [hasBeamSword, LAMP] };
const SILVER_ARROWS: Requirement = { anyOf: [item('item-060'), { allOf: [item('item-012'), item('item-078')] }] };

const STORY_EVENTS: CheckRecord[] = [
  // Intro and Hyrule Castle
  eventRecord({ n: 0, name: 'Uncle leaves the house', group: 'story', gameId: { bufferIndex: P.flags, mask: 0x10 } }),
  eventRecord({ n: 2, name: "Zelda's cell opened", group: 'story', gameId: { roomId: 0x80, mask: 0x20 }, requirements: UNCLE }),
  eventRecord({ n: 3, name: 'Zelda freed', group: 'story', gameId: { eventBit: E.zeldaFreed }, fallback: SANCTUARY, now: { followerEq: 1 }, requirements: after(2) }),
  eventRecord({ n: 6, name: 'Intro complete', group: 'story', derived: SANCTUARY }),
  // Light World
  eventRecord({ n: 7, name: "Kakariko kid's hint", group: 'story', gameId: { bufferIndex: P.mapIcons, compare: 'gte', value: 2 }, requirements: SANCTUARY }),
  eventRecord({ n: 8, name: "Sahasrahla's quest", group: 'story', gameId: { eventBit: E.sahasrahlaMapHint }, fallback: after(9), requirements: SANCTUARY }),
  eventRecord({ n: 9, name: 'Sahasrahla marks the map', group: 'story', gameId: { bufferIndex: P.mapIcons, compare: 'gte', value: 3 }, requirements: after(8) }),
  eventRecord({ n: 10, name: 'Sahasrahla gives his gift', group: 'story', gameId: { eventBit: E.sahasrahlaGift }, requirements: item('item-109') }),
  eventRecord({ n: 11, name: 'Talked to Aginah', group: 'story', gameId: { bufferIndex: P.flags, mask: 0x20 }, requirements: SANCTUARY }),
  eventRecord({ n: 12, name: 'Master Sword pulled', group: 'story', gameId: { owScreen: 0x80, mask: 0x40 },
    requirements: { count: { groupId: ITEM_GROUP_IDS.Pendants, n: 3 } } }),
  eventRecord({ n: 13, name: "Loyal Sage's last words", group: 'story', gameId: { bufferIndex: P.flags, mask: 0x02 }, requirements: after(12) }),
  eventRecord({ n: 14, name: 'Castle barrier broken', group: 'story', gameId: { owScreen: 0x1b, mask: 0x40 }, requirements: hasBeamSword }),
  eventRecord({ n: 15, name: 'Old Man found', group: 'story', gameId: { eventBit: E.followerOldMan }, fallback: after(16), now: { followerEq: 4 } }),
  eventRecord({ n: 16, name: 'Old Man rescued', group: 'story', gameId: { eventBit: E.oldManRescued }, requirements: after(15) }),
  eventRecord({ n: 17, name: "Hobo's bottle", group: 'story', gameId: { bufferIndex: P.indicator3, mask: 0x01 }, requirements: item('item-031') }),
  eventRecord({ n: 18, name: 'Bottle Merchant', group: 'story', gameId: { bufferIndex: P.indicator3, mask: 0x02 }, requirements: SANCTUARY }),
  eventRecord({ n: 19, name: "Witch's powder ready", group: 'story', gameId: { roomId: 0x109, mask: 0x80 }, requirements: item('item-042') }),
  eventRecord({ n: 20, name: 'Powder bag taken', group: 'story', gameId: { eventBit: E.powderBag }, requirements: after(19) }),
  eventRecord({ n: 21, name: 'Magic Bat summoned', group: 'story', gameId: { eventBit: E.magicBat }, requirements: item('item-014') }),
  eventRecord({ n: 22, name: 'Sword left for tempering', group: 'story', gameId: { eventBit: E.temperingPaid }, fallback: after(23),
    now: { progressIndicator3: 0x80, state: 'set' }, requirements: { allOf: [after(36), hasBeamSword] } }),
  eventRecord({ n: 23, name: 'Tempered sword collected', group: 'story', gameId: { eventBit: E.temperedSwordCollected }, requirements: after(22) }),
  eventRecord({ n: 24, name: 'Weathervane opened', group: 'story', gameId: { owScreen: 0x18, mask: 0x20 }, requirements: { allOf: [SANCTUARY, item('item-021')] } }),
  eventRecord({ n: 25, name: "King's Tomb opened", group: 'story', gameId: { owScreen: 0x14, mask: 0x20 }, requirements: item('item-076') }),
  eventRecord({ n: 26, name: 'Floodgate lever pulled', group: 'story', gameId: { eventBit: E.floodgatePulled },
    now: { owEvent: { screen: 0x3b, mask: 0x20 }, state: 'set' } }),
  eventRecord({ n: 27, name: 'Death Mountain pegs', group: 'story', gameId: { owScreen: 0x07, mask: 0x20 }, requirements: HAMMER }),
  // Dark World
  eventRecord({ n: 28, name: 'Agahnim sends Zelda away', group: 'story', gameId: { eventBit: E.agahnimAltar }, fallback: after(29), requirements: MIRROR_TOWER }),
  eventRecord({ n: 29, name: 'Agahnim 1 beaten', group: 'story', gameId: { bufferIndex: P.indicator, compare: 'gte', value: 3 }, requirements: { allOf: [hasSword, LAMP] } }),
  eventRecord({ n: 30, name: 'Dark World reached', group: 'story', gameId: { eventBit: E.firstDarkWorld }, fallback: after(29), now: { darkWorld: true } }),
  eventRecord({ n: 31, name: 'Kiki hired', group: 'story', gameId: { eventBit: E.followerKiki }, now: { followerEq: 10 } }),
  eventRecord({ n: 32, name: 'Palace of Darkness opened', group: 'story', gameId: { owScreen: 0x5e, mask: 0x20 }, requirements: after(31) }),
  eventRecord({ n: 33, name: "Thieves' Town opened", group: 'story', gameId: { owScreen: 0x58, mask: 0x20 }, requirements: canLiftRocks }),
  eventRecord({ n: 34, name: 'Hammer peg field cleared', group: 'story', gameId: { owScreen: 0x62, mask: 0x20 }, requirements: HAMMER }),
  eventRecord({ n: 35, name: 'Frog found', group: 'story', gameId: { eventBit: E.followerFrog }, fallback: after(36), now: { followerEq: 7 }, requirements: item('item-029') }),
  eventRecord({ n: 36, name: 'Smiths reunited', group: 'story', gameId: { bufferIndex: P.indicator3, mask: 0x20 }, requirements: after(35) }),
  // The reference's "Dark Blacksmith Ruins" is this pickup, an event with no item of its own.
  eventRecord({ n: 37, name: 'Purple Chest found', apName: 'Dark Blacksmith Ruins', group: 'story', gameId: { eventBit: E.followerPurpleChest },
    fallback: after(38), now: { followerEq: 12 }, requirements: after(36) }),
  eventRecord({ n: 38, name: 'Purple Chest opened', group: 'story', gameId: { bufferIndex: P.indicator3, mask: 0x10 }, requirements: after(37) }),
  eventRecord({ n: 39, name: 'Stumpy gives the Shovel', group: 'story', gameId: { eventBit: E.shovelFromStump } }),
  eventRecord({ n: 40, name: 'Stumpy at rest', group: 'story', gameId: { bufferIndex: P.indicator3, mask: 0x08 }, requirements: item('item-021') }),
  eventRecord({ n: 41, name: 'Big Bomb bought', group: 'story', gameId: { eventBit: E.followerBigBomb }, fallback: after(42), now: { followerEq: 13 },
    requirements: { allOf: [item('item-116'), item('item-117')] } }),
  eventRecord({ n: 42, name: 'Pyramid Fairy wall blown up', group: 'story', gameId: { owScreen: 0x5b, mask: 0x02 }, requirements: after(41) }),
  eventRecord({ n: 43, name: 'Skull Woods back entrance burned', group: 'story', gameId: { owScreen: 0x40, mask: 0x20 }, requirements: item('item-008') }),
  eventRecord({ n: 44, name: 'Misery Mire opened', group: 'story', gameId: { owScreen: 0x70, mask: 0x20 }, requirements: { allOf: [item('item-017'), hasSword] } }),
  eventRecord({ n: 45, name: 'Turtle Rock opened', group: 'story', gameId: { owScreen: 0x47, mask: 0x20 }, requirements: { allOf: [item('item-018'), hasSword] } }),
  eventRecord({ n: 46, name: 'Maiden freed', group: 'story', gameId: { eventBit: E.followerMaiden }, fallback: after(47), now: { followerEq: 6 }, requirements: item('item-086') }),
  eventRecord({ n: 47, name: 'Blind revealed', group: 'story', gameId: { roomId: 0xac, mask: 0x200 }, requirements: after(46) }),
  // Endgame
  eventRecord({ n: 48, name: "Ganon's Tower opened", group: 'story', gameId: { owScreen: 0x43, mask: 0x20 }, requirements: hasCrystals(7) }),
  eventRecord({ n: 49, name: 'Agahnim 2 beaten', group: 'story', gameId: { roomId: 0x0d, mask: 0x800 },
    requirements: { allOf: [hasSword, item('item-011'), item('item-012'), hasFireSource, HAMMER, item('item-022')] } }),
  eventRecord({ n: 50, name: 'Pyramid hole opened', group: 'story', gameId: { owScreen: 0x5b, mask: 0x20 }, requirements: after(49) }),
  eventRecord({ n: 51, name: 'Ganon beaten', group: 'story', gameId: { eventBit: E.ganonBeaten }, requirements: { allOf: [after(50), hasBeamSword, hasFireSource, SILVER_ARROWS] } }),
  eventRecord({ n: 52, name: 'Game completed', group: 'story', gameId: { eventBit: E.gameCompleted }, requirements: after(51) }),
  eventRecord({ n: 53, name: 'Desert statues prayed open', group: 'story', gameId: { eventBit: E.desertPrayer }, now: { desertStatuesMoved: true } }),
  // Statuses: things that are true for a while. The first has an "ever" side (stage 2 reached);
  // the other three have none, so their tick follows the status itself (statusOnly).
  eventRecord({ n: 54, name: 'Kakariko guards on alert', group: 'status', gameId: { bufferIndex: P.indicator, compare: 'gte', value: 2 },
    now: { progressIndicatorEq: 2 }, requirements: SANCTUARY }),
  eventRecord({ n: 55, name: 'Raining', group: 'status', now: { progressIndicatorLt: 2 }, statusOnly: true }),
  eventRecord({ n: 56, name: 'Bunny form', group: 'status', now: { bunny: true }, statusOnly: true }),
  eventRecord({ n: 57, name: 'Crystal switch flipped', group: 'status', now: { crystalSwitchFlipped: true }, statusOnly: true }),
];

export { STORY_EVENTS };
