#include "game_hooks.h"
#include <stdio.h>
#include <emscripten.h>
#include "src/variables.h"
#include "src/assets.h"
#include "src/zelda_rtl.h"
#include "src/config.h"
#include "snes/ppu.h"

#define MAX_OVERRIDES 256

typedef struct {
  uint16 room_id;
  uint8 original_item;
  uint8 new_item;
} ItemOverride;

static ItemOverride g_overrides[MAX_OVERRIDES];
static int g_override_count = 0;

uint8 GameHook_OverrideChestItem(uint16 room_id, uint8 original_item) {
  for (int i = 0; i < g_override_count; i++) {
    if (g_overrides[i].room_id == room_id && g_overrides[i].original_item == original_item) {
      printf("[Randomizer] Room %d: item 0x%02x -> 0x%02x\n",
             room_id, original_item, g_overrides[i].new_item);
      return g_overrides[i].new_item;
    }
  }
  return original_item;
}

EMSCRIPTEN_KEEPALIVE
void WasmSetItemOverride(int room_id, int original_item, int new_item) {
  if (g_override_count >= MAX_OVERRIDES) {
    printf("[Randomizer] Override table full!\n");
    return;
  }
  // Update existing entry if one matches
  for (int i = 0; i < g_override_count; i++) {
    if (g_overrides[i].room_id == (uint16)room_id && g_overrides[i].original_item == (uint8)original_item) {
      g_overrides[i].new_item = (uint8)new_item;
      printf("[Randomizer] Updated override: room %d, item 0x%02x -> 0x%02x\n",
             room_id, original_item, new_item);
      return;
    }
  }
  g_overrides[g_override_count].room_id = (uint16)room_id;
  g_overrides[g_override_count].original_item = (uint8)original_item;
  g_overrides[g_override_count].new_item = (uint8)new_item;
  g_override_count++;
  printf("[Randomizer] Added override: room %d, item 0x%02x -> 0x%02x\n",
         room_id, original_item, new_item);
}

EMSCRIPTEN_KEEPALIVE
void WasmClearItemOverrides(void) {
  g_override_count = 0;
  printf("[Randomizer] Cleared all overrides\n");
}

// ─── Tracker Notifications ───

void GameHook_NotifyItemReceived(uint8 item_id, uint8 method) {
  EM_ASM({
    if (typeof window !== 'undefined' && window.__onItemReceived) {
      window.__onItemReceived($0, $1);
    }
  }, item_id, method);
}

// ─── Inventory State Query ───

// Shared buffer for passing inventory state to JS.
// JS reads this via HEAPU8[ptr] after calling WasmGetInventoryState.
static uint8 g_inventory_buf[40];

EMSCRIPTEN_KEEPALIVE
int WasmGetInventoryState(void) {
  g_inventory_buf[0]  = link_item_bow;
  g_inventory_buf[1]  = link_item_boomerang;
  g_inventory_buf[2]  = link_item_hookshot;
  g_inventory_buf[3]  = link_item_bombs;
  g_inventory_buf[4]  = link_item_mushroom;
  g_inventory_buf[5]  = link_item_fire_rod;
  g_inventory_buf[6]  = link_item_ice_rod;
  g_inventory_buf[7]  = link_item_bombos_medallion;
  g_inventory_buf[8]  = link_item_ether_medallion;
  g_inventory_buf[9]  = link_item_quake_medallion;
  g_inventory_buf[10] = link_item_torch;
  g_inventory_buf[11] = link_item_hammer;
  g_inventory_buf[12] = link_item_flute;
  g_inventory_buf[13] = link_item_bug_net;
  g_inventory_buf[14] = link_item_book_of_mudora;
  g_inventory_buf[15] = link_item_cane_somaria;
  g_inventory_buf[16] = link_item_cane_byrna;
  g_inventory_buf[17] = link_item_cape;
  g_inventory_buf[18] = link_item_mirror;
  g_inventory_buf[19] = link_item_gloves;
  g_inventory_buf[20] = link_item_boots;
  g_inventory_buf[21] = link_item_flippers;
  g_inventory_buf[22] = link_item_moon_pearl;
  g_inventory_buf[23] = link_sword_type;
  g_inventory_buf[24] = link_shield_type;
  g_inventory_buf[25] = link_armor;
  g_inventory_buf[26] = link_bottle_info[0];
  g_inventory_buf[27] = link_bottle_info[1];
  g_inventory_buf[28] = link_bottle_info[2];
  g_inventory_buf[29] = link_bottle_info[3];
  g_inventory_buf[30] = link_which_pendants;
  g_inventory_buf[31] = link_has_crystals;
  g_inventory_buf[32] = link_heart_pieces;
  g_inventory_buf[33] = link_health_capacity;
  // Return pointer to buffer; JS reads HEAPU8[ptr..ptr+34]
  return (int)g_inventory_buf;
}

// ─── Room Flags Query ───
// Exposes save_dung_info (320 uint16 entries = 640 bytes) to JS.
// Each entry has chest-open bits at 0x100-0x2000 (bits 8-13).
EMSCRIPTEN_KEEPALIVE
int WasmGetRoomFlags(void) {
  return (int)save_dung_info;
}

// ─── Live Room Flags Query ───
// Returns a 4-byte buffer: [roomIndex_lo, roomIndex_hi, flags_lo, flags_hi]
// where flags is dung_savegame_state_bits >> 4 (same format as save_dung_info bits 4-11).
// This gives real-time room state before SRAM sync happens.
static uint8 live_room_buf[4];
EMSCRIPTEN_KEEPALIVE
int WasmGetLiveRoomFlags(void) {
  uint16 room = dungeon_room_index;
  uint16 flags = dung_savegame_state_bits >> 4;
  live_room_buf[0] = room & 0xFF;
  live_room_buf[1] = (room >> 8) & 0xFF;
  live_room_buf[2] = flags & 0xFF;
  live_room_buf[3] = (flags >> 8) & 0xFF;
  return (int)live_room_buf;
}

// ─── Overworld Event Flags Query ───
// Exposes save_ow_event_info (128 uint8 entries) to JS.
// Bit 0x40 indicates the standing item on that overworld screen was collected.
EMSCRIPTEN_KEEPALIVE
int WasmGetOverworldFlags(void) {
  return (int)save_ow_event_info;
}

// ─── Progress Flags Query ───
// Returns a buffer with SRAM/inventory bytes for NPC check tracking.
// [0]  = sram_progress_indicator (0xF3C5)
// [1]  = sram_progress_flags (0xF3C6)
// [2]  = sram_progress_indicator_3 (0xF3C9)
// [3]  = link_item_flippers (King Zora detection)
// [4]  = link_item_boots (Sahasrahla detection)
// [5]  = link_item_bug_net (Sick Kid detection)
// [6]  = link_item_mirror (Old Man detection)
// [7]  = link_item_quake_medallion (Catfish detection)
// [8]  = link_magic_consumption (Magic Bat detection)
// [9]  = save_dung_info[0x109] lo byte (Potion Shop — bit 0x80)
// [10] = save_dung_info[0x123] lo byte (Mini Moldorm Cave — bit 0x40)
// [11] = save_dung_info[0x11E] lo byte (Hype Cave — bit 0x40)
// [12] = player_sleep_in_bed_state (0=asleep, 1=uncle woke, 2=out of bed)
static uint8 g_progress_buf[16];

EMSCRIPTEN_KEEPALIVE
int WasmGetProgressFlags(void) {
  g_progress_buf[0] = sram_progress_indicator;
  g_progress_buf[1] = sram_progress_flags;
  g_progress_buf[2] = sram_progress_indicator_3;
  g_progress_buf[3] = link_item_flippers;
  g_progress_buf[4] = link_item_boots;
  g_progress_buf[5] = link_item_bug_net;
  g_progress_buf[6] = link_item_mirror;
  g_progress_buf[7] = link_item_quake_medallion;
  g_progress_buf[8] = link_magic_consumption;
  g_progress_buf[9] = (uint8)(save_dung_info[0x109]);
  g_progress_buf[10] = (uint8)(save_dung_info[0x123]);
  g_progress_buf[11] = (uint8)(save_dung_info[0x11E]);
  g_progress_buf[12] = player_sleep_in_bed_state;
  return (int)g_progress_buf;
}

// ─── Programmatic Check Trigger ───
// Forward-declare Link_ReceiveItem from player.c
extern void Link_ReceiveItem(uint8 item, int chest_position);

// For visual chest-open tile updates
#include "src/misc.h"
#include "src/dungeon.h"

static const uint16 kChestOpenMasksHook[] = { 0x100, 0x200, 0x400, 0x800, 0x1000, 0x2000 };

// Try to visually open the chest tiles if Link is in the matching room.
// Walks kDungeonRoomChests to find the chest location, then updates tile maps
// the same way OpenChestForItem does.
static void TryVisualChestOpen(uint16 room_id, uint8 chest_index) {
  if (dungeon_room_index != room_id) {
    printf("[GameHook] Visual skip: Link in room 0x%03x, chest in 0x%03x\n",
           dungeon_room_index, room_id);
    return;
  }

  const uint8 *chest_data = kDungeonRoomChests;
  int target_idx = chest_index;
  for (int i = 0; i < kDungeonRoomChests_SIZE; i += 3, chest_data += 3) {
    uint16 chest_room = *(uint16 *)chest_data;
    if ((chest_room & 0x7fff) == room_id) {
      if (target_idx == 0) {
        // Found the chest entry
        uint16 loc = dung_chest_locations[chest_index];
        uint16 pos = (loc & 0x7fff) >> 1;
        const uint16 *ptr = SrcPtr(0x14A4); // opened chest tile graphics

        overworld_tileattr[pos + 0]  = ptr[0];
        overworld_tileattr[pos + 64] = ptr[1];
        overworld_tileattr[pos + 1]  = ptr[2];
        overworld_tileattr[pos + 65] = ptr[3];

        // Update collision attrs to passable
        dung_bg2_attr_table[pos + 0]  = 0x27;
        dung_bg2_attr_table[pos + 64] = 0x27;
        dung_bg2_attr_table[pos + 1]  = 0x27;
        dung_bg2_attr_table[pos + 65] = 0x27;

        // Queue VRAM upload for the 4 tiles
        uint16 *dst = &vram_upload_data[vram_upload_offset >> 1];
        dst[0]  = Dungeon_MapVramAddr(pos + 0);
        dst[3]  = Dungeon_MapVramAddr(pos + 64);
        dst[6]  = Dungeon_MapVramAddr(pos + 1);
        dst[9]  = Dungeon_MapVramAddr(pos + 65);
        dst[2]  = ptr[0];
        dst[5]  = ptr[1];
        dst[8]  = ptr[2];
        dst[11] = ptr[3];
        dst[1]  = 0x100;
        dst[4]  = 0x100;
        dst[7]  = 0x100;
        dst[10] = 0x100;
        dst[12] = 0xffff;
        vram_upload_offset += 24;
        nmi_load_bg_from_vram = 1;

        Dungeon_FlagRoomData_Quadrants();
        sound_effect_2 = 14;

        printf("[GameHook] Visual chest open: room=0x%03x loc=0x%04x pos=%d\n",
               room_id, loc, pos);
        return;
      }
      target_idx--;
    }
  }
  printf("[GameHook] Visual skip: chest_index %d not found in room 0x%03x data\n",
         chest_index, room_id);
}

void GameHook_TriggerCheck(uint16 room_id, uint8 chest_index, uint8 item_id) {
  if (chest_index > 5) {
    printf("[GameHook] Invalid chest_index %d (max 5)\n", chest_index);
    return;
  }

  // 1. Set the chest-open flag.
  //    save_dung_info format: bits 4-11 hold chest/state flags (>>4 from dung_savegame_state_bits).
  //    For the CURRENT room, we must set dung_savegame_state_bits (runtime state)
  //    because Dung_SaveDataForCurrentRoom() will overwrite save_dung_info from it.
  //    For OTHER rooms, we set save_dung_info directly with the shifted mask.
  if (dungeon_room_index == room_id) {
    dung_savegame_state_bits |= kChestOpenMasksHook[chest_index];
    printf("[GameHook] TriggerCheck: room=0x%03x chest=%d item=0x%02x state_bits=0x%04x (current room)\n",
           room_id, chest_index, item_id, dung_savegame_state_bits);
  } else {
    // For non-current rooms, save_dung_info uses masks shifted right by 4
    save_dung_info[room_id] |= (kChestOpenMasksHook[chest_index] >> 4);
    printf("[GameHook] TriggerCheck: room=0x%03x chest=%d item=0x%02x flags=0x%04x (remote room)\n",
           room_id, chest_index, item_id, save_dung_info[room_id]);
  }

  // 2. Visually open the chest tiles (if Link is in the right room)
  TryVisualChestOpen(room_id, chest_index);

  // 3. Set item_receipt_method=1 (chest) so the hold-up animation plays
  item_receipt_method = 1;

  // 4. Call Link_ReceiveItem — this handles:
  //    - Setting up the item-above-head ancilla/animation
  //    - Granting the item to inventory
  //    - Calling GameHook_NotifyItemReceived (JS notification)
  //    - Refreshing the HUD
  Link_ReceiveItem(item_id, 0);
}

EMSCRIPTEN_KEEPALIVE
void WasmTriggerCheck(int room_id, int chest_index, int item_id) {
  GameHook_TriggerCheck((uint16)room_id, (uint8)chest_index, (uint8)item_id);
}

// ─── NPC Check Trigger ───
// Programmatically trigger NPC-type checks (Uncle, Sahasrahla, etc.)
// Replicates the actual in-game check sequence:
//   1. Sets the SRAM progress flag
//   2. Transitions the NPC sprite to its "post-check" visual state
//   3. Gives the item via Link_ReceiveItem
//
// Parameters:
//   flag_type: 0 = sram_progress_flags, 1 = sram_progress_indicator, 2 = sram_progress_indicator_3
//   flag_mask: the bit(s) to set in the flag byte
//   item_id:   the item to give via Link_ReceiveItem
//   sprite_type_id: sprite type to find and transition (0xFF = none). Uncle = 0x73.
//   post_gfx: sprite_graphics value for the post-check visual (Uncle = 1 = "lying down")

void GameHook_TriggerNpcCheck(uint8 flag_type, uint8 flag_mask, uint8 item_id,
                              uint8 sprite_type_id, uint8 post_gfx) {
  // 1. Set the progress flag
  switch (flag_type) {
    case 0:
      sram_progress_flags |= flag_mask;
      printf("[GameHook] TriggerNpcCheck: sram_progress_flags |= 0x%02x → 0x%02x, item=0x%02x\n",
             flag_mask, sram_progress_flags, item_id);
      break;
    case 1:
      sram_progress_indicator |= flag_mask;
      printf("[GameHook] TriggerNpcCheck: sram_progress_indicator |= 0x%02x → 0x%02x, item=0x%02x\n",
             flag_mask, sram_progress_indicator, item_id);
      break;
    case 2:
      sram_progress_indicator_3 |= flag_mask;
      printf("[GameHook] TriggerNpcCheck: sram_progress_indicator_3 |= 0x%02x → 0x%02x, item=0x%02x\n",
             flag_mask, sram_progress_indicator_3, item_id);
      break;
    default:
      printf("[GameHook] TriggerNpcCheck: invalid flag_type %d\n", flag_type);
      return;
  }

  // 2. Transition the NPC sprite to post-check state (visual change)
  if (sprite_type_id != 0xFF) {
    for (int k = 15; k >= 0; k--) {
      if (sprite_state[k] != 0 && sprite_type[k] == sprite_type_id) {
        // Advance the sprite past its "give item" state
        sprite_ai_state[k] = 2;
        sprite_graphics[k] = post_gfx;
        printf("[GameHook] Sprite slot %d (type=0x%02x): ai_state→2, graphics→%d\n",
               k, sprite_type_id, post_gfx);
        break;
      }
    }
  }

  // 3. Set additional progress state for specific NPCs
  if (sprite_type_id == 0x73) {  // Uncle
    which_starting_point = 3;
    sram_progress_indicator = 1;
  } else if (sprite_type_id == 0x3A) {  // Magic Bat — sets half magic directly
    link_magic_consumption = 1;
  }

  // 4. Set item_receipt_method matching the game's behavior
  item_receipt_method = 0;

  // 5. Give the item (skip for 0xFF = no item, e.g. tagalongs/special effects)
  if (item_id != 0xFF) {
    Link_ReceiveItem(item_id, 0);
  }

  // 6. For room-flag-based NPCs, set the room flag for detection
  //    Mini Moldorm Cave (0x123) and Hype Cave (0x11E) use bit 0x40
  if (sprite_type_id == 0x28) {
    // DarkWorldHintNPC — set the room item flag
    uint16 room = dungeon_room_index;
    save_dung_info[room] |= 0x40;
    printf("[GameHook] Room flag: save_dung_info[0x%03x] |= 0x40\n", room);
  }
}

EMSCRIPTEN_KEEPALIVE
void WasmTriggerNpcCheck(int flag_type, int flag_mask, int item_id,
                         int sprite_type_id, int post_gfx) {
  GameHook_TriggerNpcCheck((uint8)flag_type, (uint8)flag_mask, (uint8)item_id,
                           (uint8)sprite_type_id, (uint8)post_gfx);
}

// ─── Viewport Info for Edge Glow Shader ───
// Returns a pointer to a static buffer with viewport/game-state info:
//   [0]  main_module_index (uint8) — game state (7=dungeon, 9=overworld, etc.)
//   [1]  submodule_index (uint8)
//   [2]  extraLeftRight (uint8) — max extra pixels per side (from config)
//   [3]  extraLeftCur (uint8) — actual valid content pixels on left edge
//   [4]  extraRightCur (uint8) — actual valid content pixels on right edge
//   [5]  extraBottomCur (uint8) — actual valid content pixels below 224
//   [6-7] snes_width (uint16 LE) — total render width in pixels
//   [8-9] snes_height (uint16 LE) — total render height in pixels
static uint8 g_viewport_buf[10];

EMSCRIPTEN_KEEPALIVE
int WasmGetViewportInfo(void) {
  g_viewport_buf[0] = main_module_index;
  g_viewport_buf[1] = submodule_index;
  g_viewport_buf[2] = g_zenv.ppu->extraLeftRight;
  g_viewport_buf[3] = g_zenv.ppu->extraLeftCur;
  g_viewport_buf[4] = g_zenv.ppu->extraRightCur;
  g_viewport_buf[5] = g_zenv.ppu->extraBottomCur;
  uint16 w = (uint16)(g_config.extended_aspect_ratio * 2 + 256);
  uint16 h = g_config.extend_y ? 240 : 224;
  g_viewport_buf[6] = w & 0xFF;
  g_viewport_buf[7] = (w >> 8) & 0xFF;
  g_viewport_buf[8] = h & 0xFF;
  g_viewport_buf[9] = (h >> 8) & 0xFF;
  return (int)g_viewport_buf;
}
