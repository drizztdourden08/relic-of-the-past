/* @layer shared-game @kind data */
/**
 * The record id of every item the engine names, under a code handle.
 *
 * The engine used to spell an item's NAME wherever a rule, the pool or a lock had to say
 * which item it meant, which made the name a key: two records could not share one, a
 * relabel moved a placement, and the engine's spelling and the record's had to agree by
 * hand. An id is the record's own primary key, so the handle below is a reference and never
 * a second copy of the data. A name is read back off the record when something is displayed
 * (`getItem(id).name`) and is needed nowhere else.
 *
 * Same bargain as `ITEM_GROUP_IDS` (shared/game/data/item-groups/ids.ts): the ids resolve at
 * compile time, so a call site reads a named property and stops typechecking if the handle
 * is gone, while the record it points at is free to change anything but its id.
 */
import type { ItemId } from '@shared/game/data/types/ids';

const ITEM = {
  // Blades, and the family a copy climbs.
  fighterSword: 'item-074', masterSword: 'item-002', temperedSword: 'item-003',
  goldenSword: 'item-004', progressiveSword: 'item-079',
  // Shields and mail.
  blueShield: 'item-005', redShield: 'item-006', mirrorShield: 'item-007',
  progressiveShield: 'item-080',
  blueMail: 'item-035', redMail: 'item-036', progressiveMail: 'item-081',
  // Gloves.
  powerGlove: 'item-028', titansMitts: 'item-029', progressiveGlove: 'item-082',
  // Bows. The alternate row rides the same ladder as the main one.
  bow: 'item-012', silverBow: 'item-060', progressiveBow: 'item-083',
  progressiveBowAlt: 'item-172',
  // Rods, canes, the cloak and the powder: everything that spends the meter.
  fireRod: 'item-008', iceRod: 'item-009', caneOfSomaria: 'item-022', caneOfByrna: 'item-025',
  cape: 'item-026', magicPowder: 'item-014', lamp: 'item-019',
  // Medallions.
  bombos: 'item-016', ether: 'item-017', quake: 'item-018',
  // The rest of the kit.
  hammer: 'item-010', hookshot: 'item-011', shovel: 'item-020', flute: 'item-021',
  flippers: 'item-031', moonPearl: 'item-032', bugCatchingNet: 'item-034',
  bookOfMudora: 'item-030', magicMirror: 'item-027', mushroom: 'item-042',
  pegasusBoots: 'item-076', blueBoomerang: 'item-013', redBoomerang: 'item-043',
  // Bottles and what one can hold.
  bottle: 'item-023', bottleRedPotion: 'item-044', bottleGreenPotion: 'item-045',
  bottleBluePotion: 'item-046', bottleBee: 'item-061', bottleFairy: 'item-062',
  bottleGoodBee: 'item-073',
  redPotion: 'item-047', greenPotion: 'item-048', bluePotion: 'item-049', bee: 'item-015',
  // Hearts.
  heartContainer: 'item-039', bossHeartContainer: 'item-063',
  sanctuaryHeartContainer: 'item-064', pieceOfHeart: 'item-024',
  // Counters and the rungs that grow them.
  magicUpgradeHalf: 'item-077', magicUpgradeQuarter: 'item-135',
  bombUpgradePlus5: 'item-132', bombUpgradePlus10: 'item-133', bombUpgrade50: 'item-134',
  arrowUpgradePlus5: 'item-129', arrowUpgradePlus10: 'item-130', arrowUpgrade70: 'item-131',
  // Consumables and coin.
  singleArrow: 'item-068', arrows10: 'item-069', bombs3: 'item-041', bombs10: 'item-050',
  rupee1: 'item-053', rupees5: 'item-054', rupees20: 'item-055', rupees50: 'item-066',
  rupees100: 'item-065', rupees300: 'item-071',
  // Generic keys, and each dungeon's own.
  smallKey: 'item-037', bigKey: 'item-051', map: 'item-052', compass: 'item-038',
  smallKeyHyruleCastle: 'item-096', bigKeyHyruleCastle: 'item-095',
  smallKeyAgahnimsTower: 'item-099',
  smallKeyEasternPalace: 'item-097', bigKeyEasternPalace: 'item-094',
  smallKeyDesertPalace: 'item-098', bigKeyDesertPalace: 'item-093',
  smallKeyTowerOfHera: 'item-105', bigKeyTowerOfHera: 'item-087',
  smallKeyPalaceOfDarkness: 'item-101', bigKeyPalaceOfDarkness: 'item-091',
  smallKeySwampPalace: 'item-100', bigKeySwampPalace: 'item-092',
  smallKeySkullWoods: 'item-103', bigKeySkullWoods: 'item-089',
  smallKeyThievesTown: 'item-106', bigKeyThievesTown: 'item-086',
  smallKeyIcePalace: 'item-104', bigKeyIcePalace: 'item-088',
  smallKeyMiseryMire: 'item-102', bigKeyMiseryMire: 'item-090',
  smallKeyTurtleRock: 'item-107', bigKeyTurtleRock: 'item-085',
  smallKeyGanonsTower: 'item-108', bigKeyGanonsTower: 'item-084',
  // Dungeon rewards.
  greenPendant: 'item-056', redPendant: 'item-057', bluePendant: 'item-058',
  crystal1: 'item-112', crystal2: 'item-113', crystal3: 'item-114', crystal4: 'item-115',
  crystal5: 'item-116', crystal6: 'item-117', crystal7: 'item-118',
  // The moments the rules read as done, and the goal.
  beatAgahnim1: 'item-119', beatAgahnim2: 'item-120', getFrog: 'item-121',
  returnSmith: 'item-122', pickUpPurpleChest: 'item-123', openFloodgate: 'item-124',
  activatedFlute: 'item-075', triforce: 'item-173',
  // Randomizer-only pickups.
  triforcePiece: 'item-174', powerStar: 'item-169',
} as const satisfies Record<string, ItemId>;

/**
 * A pool item the dataset holds NO record for, carried as its own name behind a prefix that
 * cannot be mistaken for an id.
 *
 * Three groups, all reported with step 10c:
 *
 *  - the counter catalog's generated rungs. A family's upgrade item is minted by formula per
 *    family and jump (shared/game/data/capacity-upgrade-names.data.ts), which is 110 names and
 *    8 records: the two counted families' third to seventh tier jumps, and every rung of the
 *    hundred-step wallet ladder, exist only as names. Those rows are settings' business and
 *    this step leaves them alone;
 *  - the retro quiver. Its own comment says it has a record; it does not;
 *  - the capacity shop's event, which says the shop is standable in. It is a logic event of the
 *    generator's model and never a pickup, so there is no receive id to file a record under.
 *
 * Each becomes an ordinary `ItemId` the day a record exists, and nothing else has to change:
 * the engine already only ever compares keys, and a name is read back through
 * display-names/item-key-name.ts either way.
 */
const UNRECORDED_PREFIX = 'unrecorded-';

type UnrecordedItem = `${typeof UNRECORDED_PREFIX}${string}`;

/** What the engine may hold: a record's id, or a name with no record behind it. */
type ItemKey = ItemId | UnrecordedItem;

const unrecordedItem = (name: string): UnrecordedItem => `${UNRECORDED_PREFIX}${name}`;

const isUnrecordedItem = (item: ItemKey): item is UnrecordedItem => item.startsWith(UNRECORDED_PREFIX);

/** The name behind an unrecorded key. */
const nameOfUnrecorded = (item: UnrecordedItem): string => item.slice(UNRECORDED_PREFIX.length);

/** The two one-offs, spelled once. */
const UNRECORDED = {
  capacityShopEvent: unrecordedItem('Capacity Upgrade Shop'),
  quiver: unrecordedItem('Quiver'),
} as const;

export { ITEM, UNRECORDED, isUnrecordedItem, nameOfUnrecorded, unrecordedItem };
export type { ItemKey, UnrecordedItem };
