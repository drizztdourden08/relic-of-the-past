/* @layer core-game-hooks @kind native */
// The item sheen over the hold-up ceremony: the glint item_sheen.c sweeps across a
// substituted item lying in the world, swept across the same item once the player holds
// it up, so the picture that caught the light on the floor keeps catching it overhead.
//
// The world draws decode their art fresh every frame, so the sweep there paints over a
// clean picture each time. The hold-up decodes ONCE at spawn (misc.c AncillaAdd_ItemReceipt)
// and then leaves the slot alone, apart from the repairs that run ahead of this hook at
// frame end (the message-box re-decode, the coloured gem's cycle, the capacity icon, the
// quiver picture). So this keeps two copies of the slot: the clean picture and the picture
// it painted last. At each frame end, while a hold-up receipt lives, a slot that still
// holds last frame's painted picture is put back to the clean one before the next
// diagonal goes on; a slot that differs was rewritten by someone ahead of us, and that
// fresh picture becomes the clean one. When the receipt is gone the clean picture goes
// back, so the slot is left as the decode wrote it.
//
// The palette row is the one the vendored draw (ancilla.c Ancilla_ReceiveItem_Draw)
// settles on: the presentation item's own entry, answered through the quiver, capacity
// icon and coloured gem reads, with the receipt's fallback row for its animated ids.
//
// Rupee receipts are skipped, as in the world: the gem art carries its own highlight.
//
// Gate: kFeatures3_ItemSheen. Off, nothing is read, kept or written.
#include "game_hooks_internal.h"
#include "decode_slot.h"
#include "sprite_art_slots.h"
#include "src/sprite.h"

#define ANCILLA_ITEM_RECEIPT 0x22

static bool g_have;
static uint8 g_clean[SPRITE_ART_BYTES];
static uint8 g_painted[SPRITE_ART_BYTES];

// The live hold-up receipt's ancilla index, or -1.
static int LiveHoldUp(void) {
  for (int k = 0; k < 10; k++) {
    if (ancilla_type[k] == ANCILLA_ITEM_RECEIPT) return k;
  }
  return -1;
}

// The OAM palette row the hold-up draw of ancilla |k| uses this frame.
static uint8 HoldUpRow(int k) {
  uint8 item = ancilla_item_to_link[k];
  uint8 row = GameHook_QuiverPalette(item, GameHook_ReceiptPalette(item,
      GameHook_RupeeGemPalette(item, kWishPond2_OamFlags[item])));
  // The animated ids answer 0xff and draw with the ancilla's own row (the receipt's
  // fallback, 5); the OAM flags byte keeps three bits of it.
  if (sign8(row)) row = ancilla_arr4[k] & 7;
  return row;
}

// The slot as the decode left it, if this hook's last paint is still what it holds.
static void RestoreClean(uint8 *slot) {
  if (g_have && memcmp(slot, g_painted, SPRITE_ART_BYTES) == 0)
    memcpy(slot, g_clean, SPRITE_ART_BYTES);
  g_have = false;
}

void GameHook_ItemSheenHoldUpFrameEnd(void) {
  uint8 *slot = g_ram + DECODE_SLOT_ADDR;
  int k = (enhanced_features3 & kFeatures3_ItemSheen) ? LiveHoldUp() : -1;
  if (k < 0) {
    RestoreClean(slot);
    return;
  }
  uint8 item = ancilla_item_to_link[k];
  if (item >= 76 || GameHook_IsRupeeReceipt(item)) {
    RestoreClean(slot);
    return;
  }
  if (!g_have || memcmp(slot, g_painted, SPRITE_ART_BYTES) != 0) {
    // Freshly decoded, or repainted by a repair ahead of us: this is the clean picture.
    memcpy(g_clean, slot, SPRITE_ART_BYTES);
    g_have = true;
  } else {
    memcpy(slot, g_clean, SPRITE_ART_BYTES);
  }
  GameHook_PaintItemSheen(HoldUpRow(k));
  memcpy(g_painted, slot, SPRITE_ART_BYTES);
}
