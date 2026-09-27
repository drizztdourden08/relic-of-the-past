/* @layer shared-game @kind data */
/**
 * Story events: the moments the game records in the battery block, read where they are, and
 * the ones it forgets, read from the ledger. Numbers 0-59 of the events' id range. Each carries
 * what it asks for in items and earlier checks, so the tracker's logic can say whether it is
 * within reach; the screen it lists under comes from event-screens.data.ts.
 *
 * Seven moments the tracker had records for before this range existed keep their own ids, in
 * `EARLY_STORY_EVENTS` at the bottom of this file. Numbers 1, 4 and 5 of the range are left
 * unused so the others keep their ids.
 */
import type { CheckId, CheckRecord, ItemId, Requirement, ScreenId } from '@shared/game/data/types';
import { ITEM_GROUP_IDS } from '@shared/game/data/item-groups';
import { canLiftHeavyRocks, canLiftRocks, canSeeInDarkRooms, hasBeamSword, hasCrystals, hasFireSource, hasSword } from '@shared/game/data/requirements/helpers';
import { EVENT_BIT as E } from './event-bits';
import { eventRecord } from './event-record';

/** Progress-buffer slots (core/game-hooks/state_queries_progress.c). */
const P = { indicator: 0, flags: 1, indicator3: 2, follower: 13, startPoint: 19, mapIcons: 20 } as const;

const UNCLE = { checkId: 'check-002' } as const;
/** The jail is the castle's Big Key door: the jailer's key opens it. */
const CASTLE_BIG_KEY: Requirement = { itemId: 'item-095' };
const SANCTUARY = { checkId: 'check-004' } as const;
const item = (id: string): Requirement => ({ itemId: id as ItemId });
/** An earlier event of this list, by its number. */
const after = (n: number): Requirement => ({ checkId: `check-${300 + n}` as CheckId });
// The tower's dark maze and the altar room past it: sight, not a torch to light.
const LAMP = canSeeInDarkRooms;
const HAMMER = item('item-010');
/** The dark world's open regions, the same screens the area events list under (event-screens.data.ts, 249 to 259). */
const DARK_WORLD_REGIONS: readonly ScreenId[] = [
  'screen-252', 'screen-255', 'screen-260', 'screen-259', 'screen-240', 'screen-238', 'screen-257', 'screen-229', 'screen-237', 'screen-233',
];
const MIRROR_TOWER: Requirement = { allOf: [hasBeamSword, LAMP] };
/**
 * A story beat that happens inside a dungeon files under it, the same as the dungeon's own
 * rows. The empty sub-area keeps the beat's name bare: the standard name orders the seed's
 * locations (scope-tables.ts), so a prefix would reorder the fill.
 */
const IN_CASTLE = { dungeonId: 'dungeon-001', subArea: '' } as const;
const IN_CASTLE_TOWER = { dungeonId: 'dungeon-002', subArea: '' } as const;
const IN_THIEVES_TOWN = { dungeonId: 'dungeon-009', subArea: '' } as const;
const IN_GANONS_TOWER = { dungeonId: 'dungeon-013', subArea: '' } as const;
const SILVER_ARROWS: Requirement = { anyOf: [item('item-060'), { allOf: [item('item-012'), item('item-078')] }] };

const STORY_EVENTS: CheckRecord[] = [
  // Intro and Hyrule Castle
  eventRecord({ n: 0, name: 'Uncle leaves the house', group: 'story', gameId: { bufferIndex: P.flags, mask: 0x10 } }),
  eventRecord({ n: 2, name: "Zelda's cell unlocked", group: 'story', ...IN_CASTLE, gameId: { roomId: 0x80, mask: 0x20 }, requirements: { allOf: [UNCLE, CASTLE_BIG_KEY] } }),
  eventRecord({ n: 3, name: 'Zelda freed', group: 'story', ...IN_CASTLE, gameId: { eventBit: E.zeldaFreed }, fallback: SANCTUARY, now: { followerEq: 1 }, requirements: after(2) }),
  eventRecord({ n: 6, name: 'Intro complete', group: 'story', ...IN_CASTLE, derived: SANCTUARY }),
  // Light World
  eventRecord({ n: 7, name: "Kakariko kid's hint", group: 'story', gameId: { bufferIndex: P.mapIcons, compare: 'gte', value: 2 }, requirements: SANCTUARY }),
  eventRecord({ n: 8, name: "Sahasrahla's quest", group: 'story', gameId: { eventBit: E.sahasrahlaMapHint }, fallback: after(9), requirements: SANCTUARY }),
  eventRecord({ n: 9, name: 'Sahasrahla marks the map', group: 'story', gameId: { bufferIndex: P.mapIcons, compare: 'gte', value: 3 }, requirements: after(8) }),
  eventRecord({ n: 10, name: "Sahasrahla's trial passed", group: 'story', gameId: { eventBit: E.sahasrahlaGift }, requirements: item('item-056') }),
  // The game's own flag (progress flags 0x20) is set when his sprite first runs, on entering the
  // cave. The ledger bit is one of his lines on screen.
  eventRecord({ n: 11, name: 'Talked to Aginah', group: 'story', gameId: { eventBit: E.aginahTalked }, requirements: SANCTUARY }),
  eventRecord({ n: 12, name: 'Master Sword pulled', group: 'story', gameId: { owScreen: 0x80, mask: 0x40 },
    requirements: { count: { groupId: ITEM_GROUP_IDS.Pendants, n: 3 } } }),
  eventRecord({ n: 13, name: "Loyal Sage's last words", group: 'story', ...IN_CASTLE, gameId: { bufferIndex: P.flags, mask: 0x02 }, requirements: after(12) }),
  eventRecord({ n: 14, name: 'Castle barrier broken', group: 'story', gameId: { owScreen: 0x1b, mask: 0x40 }, requirements: hasBeamSword }),
  eventRecord({ n: 15, name: 'Old Man found', group: 'story', gameId: { eventBit: E.followerOldMan }, fallback: after(16), now: { followerEq: 4 } }),
  eventRecord({ n: 16, name: 'Old Man rescued', group: 'story', gameId: { eventBit: E.oldManRescued }, requirements: after(15) }),
  eventRecord({ n: 17, name: "Hobo's bottle", group: 'story', gameId: { bufferIndex: P.indicator3, mask: 0x01 }, requirements: item('item-031') }),
  // Named for the purchase, not the man: his own row is the item check of the same name.
  eventRecord({ n: 18, name: 'Bottle bought from the merchant', group: 'story', gameId: { bufferIndex: P.indicator3, mask: 0x02 }, requirements: SANCTUARY }),
  eventRecord({ n: 19, name: "Witch's powder ready", group: 'story', gameId: { roomId: 0x109, mask: 0x80 }, requirements: item('item-042') }),
  eventRecord({ n: 20, name: "Witch's brew collected", group: 'story', gameId: { eventBit: E.powderBag }, requirements: after(19) }),
  eventRecord({ n: 21, name: 'Magic Bat summoned', group: 'story', gameId: { eventBit: E.magicBat }, requirements: item('item-014') }),
  eventRecord({ n: 22, name: 'Tempering paid', group: 'story', gameId: { eventBit: E.temperingPaid }, fallback: after(23),
    // The smiths take whatever sword is in hand, none included: only an already tempered one is
    // refused, and a seed lifts that. So the reunion is the whole requirement, in both modes.
    now: { progressIndicator3: 0x80, state: 'set' }, requirements: after(36) }),
  eventRecord({ n: 23, name: 'Tempering done', group: 'story', gameId: { eventBit: E.temperedSwordCollected }, requirements: after(22) }),
  // Playing the flute here is what activates it, and the top flute replaces the plain one in the
  // slot, so a file that already holds the activated one still satisfies this.
  // The weathervane's own overworld bit, written when the flute releases the bird. This is the
  // flute's activation too: the randomizer's activated-flute slot sits on this row.
  eventRecord({ n: 24, name: 'Weathervane opened', group: 'story', gameId: { owScreen: 0x18, mask: 0x20 },
    requirements: { allOf: [SANCTUARY, { anyOf: [item('item-021'), item('item-075')] }] } }),
  eventRecord({ n: 25, name: "King's Tomb opened", group: 'story', gameId: { owScreen: 0x14, mask: 0x20 }, requirements: item('item-076') }),
  // The lever's ledger bit: the game erases its own dam bits on the next overworld load. A file
  // older than the ledger reads the heart piece the drained pond uncovers. The randomizer's
  // open-floodgate slot sits on this row.
  eventRecord({ n: 26, name: 'Floodgate lever pulled', group: 'story', gameId: { eventBit: E.floodgatePulled },
    fallback: { checkId: 'check-009' }, now: { owEvent: { screen: 0x3b, mask: 0x20 }, state: 'set' } }),
  // Three pegs behind a heavy rock, hammered in order, open the warp tile to the dark mountain top.
  eventRecord({ n: 27, name: 'Death Mountain warp pegs', group: 'story', gameId: { owScreen: 0x07, mask: 0x20 },
    requirements: { allOf: [HAMMER, canLiftHeavyRocks] } }),
  // Dark World
  eventRecord({ n: 28, name: 'Agahnim sends Zelda away', group: 'story', ...IN_CASTLE_TOWER, gameId: { eventBit: E.agahnimAltar }, fallback: after(29), requirements: MIRROR_TOWER }),
  eventRecord({ n: 29, name: 'Agahnim 1 beaten', group: 'story', ...IN_CASTLE_TOWER, gameId: { bufferIndex: P.indicator, compare: 'gte', value: 3 }, requirements: { allOf: [hasSword, LAMP] } }),
  // The first step into the dark world, from wherever it is taken: the mountain's warp counts as much as the castle gate.
  eventRecord({ n: 30, name: 'Dark World reached', group: 'story', gameId: { eventBit: E.firstDarkWorld }, fallback: after(29), reachAny: DARK_WORLD_REGIONS, now: { darkWorld: true } }),
  eventRecord({ n: 31, name: 'Kiki hired', group: 'story', gameId: { eventBit: E.followerKiki }, now: { followerEq: 10 } }),
  eventRecord({ n: 32, name: 'Palace of Darkness opened', group: 'story', gameId: { owScreen: 0x5e, mask: 0x20 }, requirements: after(31) }),
  eventRecord({ n: 33, name: "Thieves' Town opened", group: 'story', gameId: { owScreen: 0x58, mask: 0x20 }, requirements: item('item-032') }),
  eventRecord({ n: 34, name: 'Hammer peg field cleared', group: 'story', gameId: { owScreen: 0x62, mask: 0x20 }, requirements: HAMMER }),
  // The flag fields beside the read are the simulator's: what it writes when it talks to the
  // sprite (Smithy_Frog, Smithy_Homecoming), found by sprite type (trigger-plans.ts).
  eventRecord({ n: 35, name: 'Frog found', group: 'story', actorId: 'actor-003',
    gameId: { eventBit: E.followerFrog, flagType: 2, flagMask: 0x20, itemId: 255, spriteType: 26, postGfx: 0 },
    fallback: after(36), now: { followerEq: 7 }, requirements: item('item-029') }),
  eventRecord({ n: 36, name: 'Smiths reunited', group: 'story',
    gameId: { bufferIndex: P.indicator3, mask: 0x20, flagType: 2, flagMask: 0x20, itemId: 255, spriteType: 255, postGfx: 0 },
    requirements: after(35) }),
  // An event with no item of its own: picking the chest up, before the smith opens it.
  eventRecord({ n: 37, name: 'Purple Chest found', group: 'story', gameId: { eventBit: E.followerPurpleChest },
    fallback: after(38), now: { followerEq: 12 }, requirements: after(36) }),
  eventRecord({ n: 38, name: 'Purple Chest opened', group: 'story', gameId: { bufferIndex: P.indicator3, mask: 0x10 }, requirements: after(37) }),
  eventRecord({ n: 39, name: 'Flute boy asks for his flute', group: 'story', gameId: { eventBit: E.shovelFromStump } }),
  eventRecord({ n: 40, name: 'Stumpy at rest', group: 'story', gameId: { bufferIndex: P.indicator3, mask: 0x08 },
    requirements: { anyOf: [item('item-021'), item('item-075')] } }),
  eventRecord({ n: 41, name: 'Big Bomb bought', group: 'story', gameId: { eventBit: E.followerBigBomb }, fallback: after(42), now: { followerEq: 13 },
    requirements: { allOf: [item('item-116'), item('item-117')] } }),
  eventRecord({ n: 42, name: 'Pyramid Fairy wall blown up', group: 'story', gameId: { owScreen: 0x5b, mask: 0x02 }, requirements: after(41) }),
  eventRecord({ n: 43, name: 'Skull Woods back entrance burned', group: 'story', gameId: { owScreen: 0x40, mask: 0x20 }, requirements: item('item-008') }),
  eventRecord({ n: 44, name: 'Misery Mire opened', group: 'story', gameId: { owScreen: 0x70, mask: 0x20 }, requirements: { allOf: [item('item-032'), item('item-017'), hasSword] } }),
  eventRecord({ n: 45, name: 'Turtle Rock opened', group: 'story', gameId: { owScreen: 0x47, mask: 0x20 }, requirements: { allOf: [item('item-032'), item('item-018'), hasSword] } }),
  eventRecord({ n: 46, name: 'Maiden freed', group: 'story', ...IN_THIEVES_TOWN, gameId: { eventBit: E.followerMaiden }, fallback: after(47), now: { followerEq: 6 }, requirements: item('item-086') }),
  eventRecord({ n: 47, name: 'Blind revealed', group: 'story', ...IN_THIEVES_TOWN, gameId: { roomId: 0xac, mask: 0x200 }, requirements: after(46) }),
  // Endgame
  eventRecord({ n: 48, name: "Ganon's Tower opened", group: 'story', gameId: { owScreen: 0x43, mask: 0x20 }, requirements: hasCrystals(7) }),
  eventRecord({ n: 49, name: 'Agahnim 2 beaten', group: 'story', ...IN_GANONS_TOWER, gameId: { roomId: 0x0d, mask: 0x800 },
    requirements: { allOf: [hasSword, item('item-011'), item('item-012'), hasFireSource, HAMMER, item('item-022')] } }),
  eventRecord({ n: 50, name: 'Pyramid hole opened', group: 'story', gameId: { owScreen: 0x5b, mask: 0x20 }, requirements: after(49) }),
  eventRecord({ n: 51, name: 'Ganon beaten', group: 'story', gameId: { eventBit: E.ganonBeaten }, requirements: { allOf: [after(50), hasBeamSword, hasFireSource, SILVER_ARROWS] } }),
  eventRecord({ n: 52, name: 'Game completed', group: 'story', gameId: { eventBit: E.gameCompleted }, requirements: after(51) }),
  // The game keeps nothing for this one: the statues are sprites that step aside while a live flag
  // is up, and the flag drops when the desert screen is left, so the prayer is said again on every
  // visit. The ledger keeps that it was ever said; the pill says whether they stand aside now.
  // Whoever stood on the stairs behind them has said it, which also answers for a file whose
  // prayer was said before the ledger watched for it.
  eventRecord({ n: 53, name: 'Desert statues prayed open', group: 'story', gameId: { eventBit: E.desertPrayer }, fallback: { checkId: 'check-565' },
    now: { desertStatuesMoved: true }, requirements: item('item-030') }),
  // Statuses: things that are true for a while. The first has an "ever" side (stage 2 reached);
  // the other three have none, so their tick follows the status itself (statusOnly).
  eventRecord({ n: 54, name: 'Kakariko guards on alert', group: 'status', gameId: { bufferIndex: P.indicator, compare: 'gte', value: 2 },
    now: { progressIndicatorEq: 2 }, requirements: SANCTUARY }),
  eventRecord({ n: 55, name: 'Raining', group: 'status', now: { progressIndicatorLt: 2 }, statusOnly: true }),
  eventRecord({ n: 56, name: 'Bunny form', group: 'status', now: { bunny: true }, statusOnly: true }),
  eventRecord({ n: 57, name: 'Crystal switch flipped', group: 'status', now: { crystalSwitchFlipped: true }, statusOnly: true }),
];

/**
 * The seven story moments the tracker recorded before the events' id range existed. They keep
 * their original ids, which is why they are written out instead of numbered from the range.
 */
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
    // Story stage 1: the uncle lies wounded in the passage and hands over his sword and shield. He
    // lives (the credits find him recovered at home), so this is the finding, never a death.
    name: 'Uncle found wounded',
    vanillaItemIds: [],
  },
  {
    id: 'check-003',
    // The shelf's own ledger bit; a file older than the ledger reads the Sanctuary, which
    // the shelf always precedes. The spawn-point value it used to read moves on later.
    gameId: { eventBit: 42 },
    fallback: { checkId: 'check-004' },
    kind: 'event',
    screenId: 'screen-119',
    regionId: 'region-169',
    ...IN_CASTLE,
    // Zelda pushes it with you, so she has to be following.
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
    // The map-marker stage keeps climbing after the quest, so at least, never exactly.
    gameId: { bufferIndex: 20, compare: 'gte', value: 3 },
    kind: 'event',
    screenId: 'screen-209',
    regionId: 'region-088',
    name: 'Sahasrahla Quest Given',
    vanillaItemIds: [],
  },
];

export { EARLY_STORY_EVENTS, STORY_EVENTS };
