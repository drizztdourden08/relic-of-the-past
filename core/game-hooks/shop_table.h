/* @layer core-game-hooks @kind native */
// The armed-shop table: what each randomized purchasable spot is selling, and how many of
// its steps have already been bought. Split out of shop_overrides.c so that file stays
// about the three seams that sell from it.
//
// KEYING. The unmodified game does not give every shop its own room, and does not even
// give every shop its own ENTRANCE: four dark-world doors share entrance 0x60 into room
// 0x010F, and two cave doors share entrance 0x58 into room 0x0112. What does tell them
// apart is where the player walked in from — Dungeon_LoadEntrance saves the overworld
// area into `overworld_area_index_exit` before it zeroes the screen index, and that value
// stands for the whole indoor visit. So an entry is keyed by
// (room, entrance, overworld area, subtype), any of the three shop fields being
// "match anything" for a shop the earlier fields already name on their own.
//
// PERSISTENCE WITHOUT A SAVE-STATE CHANGE. How many items a slot has already sold has to
// survive a save and a reload, and no saveload struct may grow (the layout probe is
// pinned). So the counters live in the hook-owned span inside the save block that
// save_bytes.h allocates: SaveGameFile copies and checksums the whole 0x500-byte block,
// and a save state snapshots all of WRAM, so both carry the counters with NO struct
// change at all. One byte per canonical slot, so a counter is a plain read rather than a
// bit dance.
#ifndef GAME_HOOKS_SHOP_TABLE_H
#define GAME_HOOKS_SHOP_TABLE_H

#include "src/types.h"
#include "save_bytes.h"

#define SHOP_ENTRANCE_ANY (-1)
#define SHOP_OW_AREA_ANY (-1)
#define SHOP_SLOT_COUNT SRM_SHOP_SOLD_COUNT

typedef struct {
  uint8 armed;
  uint8 slot_index;   // canonical slot id, and the index of its sold counter
  uint16 room_id;
  int16 entrance;     // SHOP_ENTRANCE_ANY when the room alone identifies the shop
  int16 ow_area;      // SHOP_OW_AREA_ANY when no door of its own reaches the shop
  uint8 subtype;      // the selling sprite's own subtype
  uint8 depth_index;  // which purchase of the slot this entry is
  uint8 depth;        // how many purchases the slot carries in total
  uint8 currency;
  uint16 amount;   // rupees/arrows/bombs/whole hearts, or the bottle value demanded
  uint8 new_item;
  int16 msg;
  int16 fire_id;
} ShopSlotOverride;

// One byte per canonical slot: how many of that slot's armed steps have been bought.
// Address allocated in save_bytes.h — see the header note.
#define srm_shop_sold(slot) (*(uint8 *)(g_ram + SRM_SHOP_SOLD + (slot)))

// The armed entry for the spot the player is standing at, or NULL. |sold_out| is set when
// the table OWNS this spot but every step has already been bought — the caller then
// empties it instead of letting the vendored stock come back.
const ShopSlotOverride *ShopFindEntry(uint8 subtype, bool *sold_out);

// Closes one step. Called only after its payment was taken.
void ShopMarkSold(const ShopSlotOverride *entry);

// True once every step of |entry|'s slot has been bought: the spot comes down, and stays
// down across a reload, instead of restocking.
bool ShopSlotSoldOut(const ShopSlotOverride *entry);

#endif  // GAME_HOOKS_SHOP_TABLE_H
