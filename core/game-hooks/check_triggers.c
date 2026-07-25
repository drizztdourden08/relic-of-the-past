/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"
#include "src/misc.h"
#include "src/dungeon.h"

static const uint16 kChestOpenMasksHook[] = { 0x100, 0x200, 0x400, 0x800, 0x1000, 0x2000 };

// Try to visually open the chest tiles if the player is in the matching room.
static void TryVisualChestOpen(uint16 room_id, uint8 chest_index) {
  if (dungeon_room_index != room_id) {
    printf("[GameHook] Visual skip: player in room 0x%03x, chest in 0x%03x\n",
           dungeon_room_index, room_id);
    return;
  }

  const uint8 *chest_data = kDungeonRoomChests;
  int target_idx = chest_index;
  for (int i = 0; i < kDungeonRoomChests_SIZE; i += 3, chest_data += 3) {
    uint16 chest_room = *(uint16 *)chest_data;
    if ((chest_room & 0x7fff) == room_id) {
      if (target_idx == 0) {
        uint16 loc = dung_chest_locations[chest_index];
        uint16 pos = (loc & 0x7fff) >> 1;
        const uint16 *ptr = SrcPtr(0x14A4);

        overworld_tileattr[pos + 0]  = ptr[0];
        overworld_tileattr[pos + 64] = ptr[1];
        overworld_tileattr[pos + 1]  = ptr[2];
        overworld_tileattr[pos + 65] = ptr[3];

        dung_bg2_attr_table[pos + 0]  = 0x27;
        dung_bg2_attr_table[pos + 64] = 0x27;
        dung_bg2_attr_table[pos + 1]  = 0x27;
        dung_bg2_attr_table[pos + 65] = 0x27;

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

// Vanilla duplicate-item rule, mirrored from the chest handler (player.c:3850):
// an item with an alternate swaps to it when the primary is already owned —
// e.g. a second Lamp (0x12) becomes 5 Rupees (0x35, the Secret Passage chest).
static const uint8 kSimReceiveItemAlternates[76] = {
  255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,  68, 255, 255, 255,
  255, 255,  53, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
  255, 255, 255, 255, 255, 255, 255, 255, 255, 255,  70, 255, 255, 255, 255, 255,
  255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
  255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
};

void GameHook_TriggerCheck(uint16 room_id, uint8 chest_index, uint8 item_id) {
  if (chest_index > 5) {
    printf("[GameHook] Invalid chest_index %d (max 5)\n", chest_index);
    return;
  }

  if (dungeon_room_index == room_id) {
    dung_savegame_state_bits |= kChestOpenMasksHook[chest_index];
    printf("[GameHook] TriggerCheck: room=0x%03x chest=%d item=0x%02x state_bits=0x%04x (current room)\n",
           room_id, chest_index, item_id, dung_savegame_state_bits);
  } else {
    save_dung_info[room_id] |= (kChestOpenMasksHook[chest_index] >> 4);
    printf("[GameHook] TriggerCheck: room=0x%03x chest=%d item=0x%02x flags=0x%04x (remote room)\n",
           room_id, chest_index, item_id, save_dung_info[room_id]);
  }

  TryVisualChestOpen(room_id, chest_index);

  if (item_id < 76) {
    uint8 alt = kSimReceiveItemAlternates[item_id];
    if (alt != 0xff && g_ram[kMemoryLocationToGiveItemTo[item_id]]) {
      printf("[GameHook] TriggerCheck: duplicate item 0x%02x swapped to 0x%02x\n", item_id, alt);
      item_id = alt;
    }
  }

  item_receipt_method = 1;
  Link_ReceiveItem(item_id, 0);
}

EMSCRIPTEN_KEEPALIVE
void WasmTriggerCheck(int room_id, int chest_index, int item_id) {
  GameHook_TriggerCheck((uint16)room_id, (uint8)chest_index, (uint8)item_id);
}

// ─── NPC Check Trigger ───

void GameHook_TriggerNpcCheck(uint8 flag_type, uint8 flag_mask, uint8 item_id,
                              uint8 sprite_type_id, uint8 post_gfx) {
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

  if (sprite_type_id != 0xFF) {
    for (int k = 15; k >= 0; k--) {
      if (sprite_state[k] != 0 && sprite_type[k] == sprite_type_id) {
        sprite_ai_state[k] = 2;
        sprite_graphics[k] = post_gfx;
        printf("[GameHook] Sprite slot %d (type=0x%02x): ai_state→2, graphics→%d\n",
               k, sprite_type_id, post_gfx);
        break;
      }
    }
  }

  if (sprite_type_id == SPRITE_UNCLE_PRIEST) {
    which_starting_point = 3;
    sram_progress_indicator = 1;
  } else if (sprite_type_id == 0x3A) {
    link_magic_consumption = 1;
  }

  item_receipt_method = 0;

  if (item_id != 0xFF) {
    Link_ReceiveItem(item_id, 0);
  }

  if (sprite_type_id == 0x28) {
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

// ─── Overworld Check Trigger ───

void GameHook_TriggerOverworldCheck(uint8 screen, uint8 mask, uint8 item_id) {
  save_ow_event_info[screen] |= mask;
  printf("[GameHook] TriggerOverworldCheck: save_ow_event_info[0x%02x] |= 0x%02x → 0x%02x, item=0x%02x\n",
         screen, mask, save_ow_event_info[screen], item_id);

  item_receipt_method = 0;
  if (item_id != 0xFF) {
    Link_ReceiveItem(item_id, 0);
  }
}

EMSCRIPTEN_KEEPALIVE
void WasmTriggerOverworldCheck(int screen, int mask, int item_id) {
  GameHook_TriggerOverworldCheck((uint8)screen, (uint8)mask, (uint8)item_id);
}
