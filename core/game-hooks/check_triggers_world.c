/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"
#include "gba_alttp.h"
#include "src/misc.h"

// ─── NPC Check Trigger ───

// |assigned| tells the npc-override seam who is granting: false replays the giver's own
// vanilla grant (the substitution table applies, matched by item since the trigger
// already names the check), true delivers an item the host already assigned (the table
// must not re-substitute it). Either one-shot arms right beside the grant call, so a
// refused or itemless trigger leaves nothing armed.
static void TriggerNpcCheckImpl(uint8 flag_type, uint8 flag_mask, uint8 item_id,
                                uint8 sprite_type_id, uint8 post_gfx, bool assigned) {
  (void)post_gfx;
  if (!TriggerGrantAllowed()) return;
  // Already granted? The flag write is idempotent but Link_ReceiveItem is NOT (the
  // same guard the chest and overworld triggers carry), so a replayed trigger for a
  // flag that is already set must not hand the item over a second time.
  uint8 *flags = flag_type == 0 ? &sram_progress_flags
               : flag_type == 1 ? &sram_progress_indicator
               : flag_type == 2 ? &sram_progress_indicator_3
                                : NULL;
  if (flags == NULL) {
    printf("[GameHook] TriggerNpcCheck: invalid flag_type %d\n", flag_type);
    return;
  }
  if (flag_mask != 0 && (*flags & flag_mask) == flag_mask) {
    printf("[GameHook] TriggerNpcCheck: flag_type %d mask 0x%02x already set, no re-grant\n",
           flag_type, flag_mask);
    return;
  }
  *flags |= flag_mask;
  printf("[GameHook] TriggerNpcCheck: flag_type %d |= 0x%02x → 0x%02x, item=0x%02x\n",
         flag_type, flag_mask, *flags, item_id);

  // NOTE: this trigger deliberately does NOT touch the giver sprite's ai state. The
  // old "post-grant pose" poke set ai_state 2 on the named sprite type, and for
  // several givers ai 2 IS the granting state, so the poke replayed the giver's own
  // vanilla grant right after the delivery (the double-bottle bug). Visual post-grant
  // state now comes only from the giver's own script or from the flags above.

  if (sprite_type_id == SPRITE_UNCLE_PRIEST) {
    which_starting_point = 3;
    sram_progress_indicator = 1;
  } else if (sprite_type_id == 0x3A) {
    link_magic_consumption = 1;
  }

  item_receipt_method = 0;

  if (item_id != 0xFF) {
    SimCountReceive(1, item_id);
    if (item_id == 0x17) SimGiveHeartPiece();
    else {
      if (assigned) GameHook_NpcOverrideBypassOnce();
      else GameHook_NpcOverrideMatchAnywhereOnce();
      Link_ReceiveItem(item_id, 0);
    }
  }

  if (sprite_type_id == 0x28) {
    uint16 room = dungeon_room_index;
    (*SaveDungInfoFor(room)) |= 0x40;
    printf("[GameHook] Room flag: save_dung_info[0x%03x] |= 0x40\n", room);
  }
}

void GameHook_TriggerNpcCheck(uint8 flag_type, uint8 flag_mask, uint8 item_id,
                              uint8 sprite_type_id, uint8 post_gfx) {
  TriggerNpcCheckImpl(flag_type, flag_mask, item_id, sprite_type_id, post_gfx, false);
}

EMSCRIPTEN_KEEPALIVE
void WasmTriggerNpcCheck(int flag_type, int flag_mask, int item_id,
                         int sprite_type_id, int post_gfx) {
  TriggerNpcCheckImpl((uint8)flag_type, (uint8)flag_mask, (uint8)item_id,
                      (uint8)sprite_type_id, (uint8)post_gfx, false);
}

// The delivery queue's form: |item_id| is the host-assigned item for the check, granted
// exactly as passed: the npc-override seam is bypassed for this one receipt.
EMSCRIPTEN_KEEPALIVE
void WasmTriggerNpcCheckAssigned(int flag_type, int flag_mask, int item_id,
                                 int sprite_type_id, int post_gfx) {
  TriggerNpcCheckImpl((uint8)flag_type, (uint8)flag_mask, (uint8)item_id,
                      (uint8)sprite_type_id, (uint8)post_gfx, true);
}

// ─── Overworld Check Trigger ───

void GameHook_TriggerOverworldCheck(uint8 screen, uint8 mask, uint8 item_id) {
  if (!TriggerGrantAllowed()) return;
  // Already taken? The bit is idempotent but Link_ReceiveItem is not, so a second
  // trigger really does hand the item over again. A re-granted heart piece
  // inflates the heart count, since every fourth converts (sprite_main.c:6493).
  if (item_id != 0xFF && (save_ow_event_info[screen] & mask)) {
    printf("[GameHook] TriggerOverworldCheck: screen=0x%02x mask=0x%02x already taken, no re-grant\n", screen, mask);
    return;
  }
  save_ow_event_info[screen] |= mask;
  printf("[GameHook] TriggerOverworldCheck: save_ow_event_info[0x%02x] |= 0x%02x → 0x%02x, item=0x%02x\n",
         screen, mask, save_ow_event_info[screen], item_id);

  item_receipt_method = 0;
  if (item_id != 0xFF) {
    SimCountReceive(2, item_id);
    if (item_id == 0x17) {
      SimGiveHeartPiece();
      return;
    }
    Link_ReceiveItem(item_id, 0);
  }
}

EMSCRIPTEN_KEEPALIVE
void WasmTriggerOverworldCheck(int screen, int mask, int item_id) {
  GameHook_TriggerOverworldCheck((uint8)screen, (uint8)mask, (uint8)item_id);
}
