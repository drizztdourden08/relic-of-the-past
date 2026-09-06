/* @layer shared-game @kind data */
/**
 * Every shop the seed may stock, and the slots each of them holds.
 *
 * The reference project's own shop file is NOT part of the vendored drop
 * (tests/fixtures/ap-source carries 13 modules; Shops.py is not one of them),
 * so the vanilla inventory and its prices are transcribed from the GAME
 * instead — SpritePrep_Shopkeeper's per-room spawn table and the seven
 * ShopItem_* handlers it spawns, plus the cauldron and bomb-counter handlers
 * (core/zelda3/src/sprite_main.c). Location NAMES come from the reference,
 * verified against the datapackage ids 0x400000-0x40001a.
 *
 * ELEVEN BUILDINGS, FIVE ROOMS, ONE DISCRIMINATOR. Eleven shop-like buildings
 * stand in the unmodified world. Nine of them sell from a shelf served by the
 * shopkeeper sprite, but a building is only a door: the interior it opens is
 * an indoor room, and one room is reused by several doors. Read from the
 * game's own tables — the overworld door list (area/position/entrance id), the
 * entrance list (entrance id -> room) and each room's sprite list — the nine
 * shelf buildings resolve to FIVE shelf rooms:
 *
 *   room 0x0112 <- entrance 0x58 <- 2 doors (lake shop, dark mountain shop)
 *   room 0x0110 <- entrance 0x57 <- 1 door  (the shield shop)
 *   room 0x010F <- entrance 0x60 <- 4 doors (all four dark-world shops)
 *   room 0x00FF <- entrance 0x1E <- reached by an inner stair from the cave
 *   room 0x011F <- entrance 0x46 <- 1 door  (the village shop)
 *
 * The reference tells the doors apart by PATCHING the rom so each door gets
 * its own shop record. This app patches nothing, so it needs a discriminator
 * the running game already keeps: Dungeon_LoadEntrance saves the overworld
 * area the player walked in from (`overworld_area_index_exit`, RAM $C140)
 * before it zeroes the screen index, and that value stands for the whole
 * indoor visit. `owArea` records it per shop, and the in-core seam matches on
 * it, so two doors onto one shelf serve two different shops.
 *
 * The remaining two buildings sell from their own sprites rather than a
 * shelf and need their own seams: the potion seller's hut (three cauldrons,
 * room 0x0109) and the bomb shop's counter (one refill, room 0x011C — its
 * second sprite is the story bomb, an event rather than a purchase, and is
 * never a slot).
 *
 * A shop is therefore keyed by (room, entrance, overworld area), and a slot
 * inside it by the sprite's own subtype.
 *
 * CANONICAL ORDER IS APPEND-ONLY. A slot's position in this list is its
 * canonical index: the id of its in-core sold counter and the order the
 * sequential mode opens slots in. The five shelf rooms that shipped first
 * keep indices 0-14 exactly, so a placement stored before the doors were
 * split still names the same slots, holds the same items and reads the same
 * counters. Everything since is appended.
 */

/** Which shelf position a slot sits at; also the spawn order the game uses. */
type ShopSlotPosition = 'Left' | 'Center' | 'Right' | 'Single';

/**
 * Which physical seam sells the slot. Each has its own sprite family, its own
 * purchase gesture and its own gated call-site in core/game-hooks.
 */
type ShopKind = 'shelf' | 'cauldron' | 'bomb';

/**
 * Which half of the overworld the shop's door stands in. Recorded per shop
 * rather than derived from `owArea`, because three shops have no overworld
 * door of their own and would otherwise have no answer.
 */
type ShopWorld = 'light' | 'dark';

interface ShopSlotDef {
  position: ShopSlotPosition;
  /** What the unmodified shop sells here, for the report and the spoiler. */
  vanillaItem: string;
  /** Rupees the unmodified shop charges — the price a purchase keeps costing. */
  price: number;
  /**
   * The sprite's own subtype, which is what the running game keys its handler
   * and its art off. Distinct within every shop, so (room, area, subtype)
   * names one purchasable spot exactly.
   */
  subtype: number;
}

interface ShopDef {
  /** Reference/community name; the slot locations are "<name> <position>". */
  name: string;
  /** The cave region the slots hang off (regions-caves.data.ts). */
  region: string;
  /** Which half of the overworld its door stands in. */
  world: ShopWorld;
  /**
   * What a world-headed list calls it, when stripping the world words would
   * leave it sharing a title with another shop. Absent for every shop whose
   * own name already stands alone.
   */
  listName?: string;
  /** Which seam sells here. */
  kind: ShopKind;
  /** Indoor room index the shop stands in. */
  roomId: number;
  /** Vanilla entrance value, or null when the room alone identifies the shop. */
  entrance: number | null;
  /**
   * Overworld area of the door that opens onto this shop — the value
   * `overworld_area_index_exit` holds for the whole visit. null when no
   * overworld door reaches it (an inner stair does), and the room then
   * identifies the shop on its own.
   */
  owArea: number | null;
  slots: readonly ShopSlotDef[];
}

const slot = (
  position: ShopSlotPosition, vanillaItem: string, price: number, subtype: number,
): ShopSlotDef => ({ position, vanillaItem, price, subtype });

/**
 * The three shelf inventories the game actually spawns, by room:
 * - COMMON (rooms 0x0112 / 0x00FF / 0x011F): subtypes 7, 10, 12.
 * - SHIELDED (room 0x010F): subtypes 7, 8, 12.
 * - RARE (room 0x0110): subtypes 9, 13, 11.
 * Prices and granted ids are the literals in each ShopItem_* handler.
 */
const COMMON_SLOTS: readonly ShopSlotDef[] = [
  slot('Left', 'Red Potion', 150, 7),
  slot('Center', 'Small Heart', 10, 10),
  slot('Right', 'Bombs (10)', 50, 12),
];

const SHIELDED_SLOTS: readonly ShopSlotDef[] = [
  slot('Left', 'Red Potion', 150, 7),
  slot('Center', 'Blue Shield', 50, 8),
  slot('Right', 'Bombs (10)', 50, 12),
];

const RARE_SLOTS: readonly ShopSlotDef[] = [
  slot('Left', 'Red Shield', 500, 9),
  slot('Center', 'Bee', 10, 13),
  slot('Right', 'Arrows (10)', 30, 11),
];

/**
 * The hut's three cauldrons, in the subtype order Sprite_E9_PotionShop
 * dispatches them — 2 green, 3 blue, 4 red — with the rupee literal each
 * handler subtracts. Position here is that dispatch order, not a claim about
 * where each pot stands on screen.
 */
const CAULDRON_SLOTS: readonly ShopSlotDef[] = [
  slot('Left', 'Green Potion', 60, 2),
  slot('Center', 'Blue Potion', 160, 3),
  slot('Right', 'Red Potion', 120, 4),
];

/**
 * The bomb counter's single purchase — subtype 1, the refill Sprite_BombShop_Bomb
 * charges 100 for. Subtype 2 is the story bomb: it starts a follower and a
 * cutscene rather than handing an item over, so it is deliberately not a slot.
 */
const BOMB_SLOTS: readonly ShopSlotDef[] = [
  slot('Single', 'Bombs (10)', 100, 1),
];

/**
 * In the reference's own key order (datapackage id order) for the five rooms
 * that shipped first, then the four doors those rooms share, then the two
 * shops with seams of their own. Appending rather than interleaving is what
 * keeps a stored placement's canonical indices meaning what they meant.
 */
const SHOP_DEFS: readonly ShopDef[] = [
  {
    name: 'Cave Shop (Dark Death Mountain)',
    world: 'dark',
    region: 'Cave Shop (Dark Death Mountain)',
    kind: 'shelf',
    roomId: 0x0112,
    entrance: 0x58,
    owArea: 0x45,
    slots: COMMON_SLOTS,
  },
  {
    name: 'Red Shield Shop',
    world: 'dark',
    region: 'Red Shield Shop',
    kind: 'shelf',
    roomId: 0x0110,
    entrance: 0x57,
    owArea: 0x5a,
    slots: RARE_SLOTS,
  },
  {
    name: 'Dark Lake Hylia Shop',
    world: 'dark',
    region: 'Dark Lake Hylia Shop',
    kind: 'shelf',
    roomId: 0x010f,
    entrance: 0x60,
    owArea: 0x75,
    slots: SHIELDED_SLOTS,
  },
  {
    // No door of its own: an inner stair from the cave that shares its room.
    name: 'Light World Death Mountain Shop',
    world: 'light',
    region: 'Light World Death Mountain Shop',
    kind: 'shelf',
    roomId: 0x00ff,
    entrance: 0x1e,
    owArea: null,
    slots: COMMON_SLOTS,
  },
  {
    name: 'Kakariko Shop',
    world: 'light',
    region: 'Kakariko Shop',
    kind: 'shelf',
    roomId: 0x011f,
    entrance: 0x46,
    owArea: 0x18,
    slots: COMMON_SLOTS,
  },
  // ── The doors that share a room with one of the five above ──
  {
    // Same shelf as the dark mountain shop; told apart by the lake door's area.
    name: 'Cave Shop (Lake Hylia)',
    world: 'light',
    region: 'Cave Shop (Lake Hylia)',
    kind: 'shelf',
    roomId: 0x0112,
    entrance: 0x58,
    owArea: 0x35,
    slots: COMMON_SLOTS,
  },
  {
    name: 'Dark World Lumberjack Shop',
    world: 'dark',
    region: 'Dark World Lumberjack Shop',
    kind: 'shelf',
    roomId: 0x010f,
    entrance: 0x60,
    owArea: 0x42,
    slots: SHIELDED_SLOTS,
  },
  {
    name: 'Village of Outcasts Shop',
    world: 'dark',
    region: 'Village of Outcasts Shop',
    kind: 'shelf',
    roomId: 0x010f,
    entrance: 0x60,
    owArea: 0x58,
    slots: SHIELDED_SLOTS,
  },
  {
    name: 'Dark World Potion Shop',
    world: 'dark',
    region: 'Dark World Potion Shop',
    kind: 'shelf',
    roomId: 0x010f,
    entrance: 0x60,
    owArea: 0x56,
    slots: SHIELDED_SLOTS,
  },
  // ── The two shops with a seam of their own ──
  {
    // The potion seller's hut. Its region already holds the powder trade, which
    // is a separate location and stays exactly as it is.
    name: 'Potion Shop',
    world: 'light',
    // Shares its bare name with the dark-world shelf shop, and is the odd one
    // out twice over: cauldrons rather than a shelf, and off by default.
    listName: "Potion Seller's Hut",
    region: 'Potion Shop',
    kind: 'cauldron',
    roomId: 0x0109,
    entrance: 0x4c,
    owArea: null,
    slots: CAULDRON_SLOTS,
  },
  {
    name: 'Big Bomb Shop',
    world: 'dark',
    region: 'Big Bomb Shop',
    kind: 'bomb',
    roomId: 0x011c,
    entrance: 0x53,
    owArea: null,
    slots: BOMB_SLOTS,
  },
];

/** Slots that shipped before the doors were split — canonical indices 0-14. */
const LEGACY_SHOP_SLOT_COUNT = 15;

/** Every canonical slot there is: the ceiling of the whole shop surface. */
const STANDARD_SHOP_SLOT_COUNT = SHOP_DEFS.reduce((sum, shop) => sum + shop.slots.length, 0);

/** The hut is supported but off by default — its slots are ticked by hand. */
const DEFAULT_OFF_SHOPS: readonly string[] = ['Potion Shop'];

/** What a list headed by world calls each half. */
const SHOP_WORLD_LABELS: Readonly<Record<ShopWorld, string>> = {
  light: 'Light World',
  dark: 'Dark World',
};

/**
 * The words a world-titled heading already says, so a name listed under one
 * does not repeat them. Applied anywhere in the name, because one shop wears
 * its half inside a parenthesis rather than in front.
 */
const WORLD_WORDS_PATTERN = /\b(?:Light World|Dark World|Light|Dark)\s+/g;

/**
 * The name a shop is listed under inside its own world's section: its own
 * `listName` where it carries one, otherwise its full name with those words
 * taken out. Derived rather than stored for all but the one exception, so a
 * shop added above brings its short name with it, and the qualifier that
 * tells two same-named shops apart (the parenthesised area) survives
 * untouched.
 */
const shortShopNameOf = (shop: ShopDef): string =>
  shop.listName ?? shop.name.replace(WORLD_WORDS_PATTERN, '').trim();

export {
  DEFAULT_OFF_SHOPS, LEGACY_SHOP_SLOT_COUNT, SHOP_DEFS, SHOP_WORLD_LABELS,
  STANDARD_SHOP_SLOT_COUNT, shortShopNameOf,
};
export type { ShopDef, ShopKind, ShopSlotDef, ShopSlotPosition, ShopWorld };
