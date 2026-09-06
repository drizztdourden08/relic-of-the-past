/* @layer core-game-hooks @kind native */
// Virtual receive ids for the four DUNGEON-FLAVOURED item families — the encoding shared by
// dungeon_item_grants.c and its probes, mirrored by
// shared/game/data/dungeon-item-receive-id.ts.
//
// WHY AN ID PER (KIND, DUNGEON). Every record of a family shares one native receive id
// (small key 0x24, big key 0x32, map 0x33, compass 0x25) and the native grant credits the
// dungeon the player is STANDING IN — misc.c's receipt writes the bitfield bit
// 0x8000 >> (cur_palace_index_x2 >> 1) and bumps the live key count, which the dungeon
// exit flushes into that dungeon's earned-count byte. So the target has to travel with the
// grant, and the ONLY channel every delivery path shares is the id itself: six override
// tables store one uint8 per entry, and an online delivery arrives as a bare id through
// WasmGrantItemWithReceipt with no entry behind it at all. A "target dungeon" field on the
// override entry would cover the tables and miss delivery entirely, and a separately armed
// target register would be a second control racing the id it belongs to. The id carries it,
// exactly as a prize crystal's id carries which crystal it banks (prize_grants.c).
//
// THE ENCODING. Nibble-aligned above the prize span, so the id reads directly in a log and
// decodes in two masks with no table:
//
//   0xC0 | (kind << 4) | palace_index      kind 0 small key · 1 big key · 2 map · 3 compass
//
//   0xC0-0xCD  small key, palace index 0-13      0xE0-0xED  map
//   0xD0-0xDD  big key                            0xF0-0xFD  compass
//
// The palace index is the game's own cur_palace_index_x2 >> 1, so 0-13 covers every dungeon
// the dataset names and the two ids per block above 13 (0x?E/0x?F) are never valid. The gap
// at 0x82-0xBF, between the last prize id and this block, is the price of that alignment and
// is left free for a future dense family.
#ifndef DUNGEON_ITEM_IDS_H
#define DUNGEON_ITEM_IDS_H

#include "src/types.h"

#define DUNGEON_ITEM_VIRT_FIRST 0xC0
#define DUNGEON_ITEM_VIRT_LAST 0xFD
#define DUNGEON_ITEM_KIND_COUNT 4
// Palace indices 0-13 — the whole range cur_palace_index_x2 >> 1 can name.
#define DUNGEON_ITEM_PALACE_COUNT 14

// The native receive id each kind presents as, in kind order. These are the ids the vanilla
// receipt already knows how to draw, message and apply; the hook only redirects WHERE it
// applies them.
static const uint8 kDungeonItemNativeId[DUNGEON_ITEM_KIND_COUNT] = {0x24, 0x32, 0x33, 0x25};

static inline int DungeonItemKindOfId(uint8 item) {
  return (item >> 4) - (DUNGEON_ITEM_VIRT_FIRST >> 4);
}

static inline int DungeonItemPalaceOfId(uint8 item) {
  return item & 0x0f;
}

#endif  // DUNGEON_ITEM_IDS_H
