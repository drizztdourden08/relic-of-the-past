/* @layer core-game-hooks @kind native */
// The coloured gem in the hold-up ceremony. rupee_gem_draw.c swaps the numberless gem in
// for a rupee reward lying in the world; this is the same swap for the receipt the player
// holds up on picking it up, so the gem that was on the floor is the gem shown overhead.
//
// The three small values already hold up the numberless gem (their receipts share the gem
// sheet and differ by palette row), so only the four WIDE receipts change: the 20 with its
// digits (0x47), the 50, the 100 and the 300. For those the hold-up:
//   - decodes the gem sheet over the numbered picture at every frame end, then points the
//     gem's two colour indices at the denomination's pair (GameHook_RecolorRupeeGem). Frame
//     end runs after the spawn's own decode and after the message-box repair
//     (receipt_gfx_guard.c) and before the NMI upload, so the numbered art never reaches
//     VRAM; and it runs before the capacity icon repair, which therefore still wins for a
//     wallet upgrade presenting as the 50 receipt.
//   - cycles the three glint sheets the way the vendored hold-up cycles them for the small
//     gems (ancilla.c Ancilla22_ItemReceipt), on the same two per-ancilla counters, which
//     the vendored code never touches for a wide id.
//   - draws with the gem's palette row and the NARROW shape: two 8x8 entries stacked from
//     the slot's left column. The gem sheet's right column holds a second picture, so a
//     wide 16x16 entry would show two gems side by side. The hold-up's OAM region is two
//     entries for every id (kAncilla_Pflags), so the second entry always fits.
//   - spawns at a narrow receipt's spot: four pixels right of a wide one's, and two lower
//     on a chest or a scripted grant (misc.c AncillaAdd_ItemReceipt), the reverse of the
//     quiver picture's move (retro_quiver_icon.c).
//
// A capacity upgrade presenting as the 50 receipt keeps its icon: every answer here is
// native while the capacity icon shows for the live receipt.
//
// Gate: kFeatures3_ColoredRupees. Off, every read answers |native|, nothing is decoded
// and the spawn spot is untouched: the numbered art draws byte for byte as before.
#include "game_hooks_internal.h"
#include "src/load_gfx.h"

#define ANCILLA_ITEM_RECEIPT 0x22
// The first of the three glint sheets of the numberless gem (0x24, 0x25, 0x26).
#define GEM_SHEET_FIRST 0x24
#define GEM_SHEET_COUNT 3
// The OAM size flag kReceiveItem_Tab1 gives a narrow (8x16) receipt.
#define GEM_OAM_SIZE 0
// A narrow receipt spawns at 10 beside the player against a wide one's 6, and on a chest
// at kReceiveItem_Tab3 4 against 0 and kReceiveItem_Tab2 -2 against -4.
#define GEM_SPAWN_DX 4
#define GEM_SPAWN_DY 2

// How many frames each glint sheet holds, in sheet order: the vendored kReceiveItem_Tab4.
static const uint8 kGemGlintHold[GEM_SHEET_COUNT] = {9, 5, 5};

// True when a hold-up receipt of |item| is live.
static bool HoldUpLive(uint8 item) {
  for (int k = 0; k < 10; k++) {
    if (ancilla_type[k] == ANCILLA_ITEM_RECEIPT && ancilla_item_to_link[k] == item) return true;
  }
  return false;
}

// True when the hold-up of |item| shows the gem: the gate on, a wide rupee receipt (the
// narrow ones are the gem already), no capacity icon riding the slot for that receipt
// (asked with an impossible native, so only an icon answers), and a live hold-up of it.
static bool HoldUpGemShown(uint8 item) {
  if (!(enhanced_features3 & kFeatures3_ColoredRupees)) return false;
  if (!GameHook_IsRupeeReceipt(item) || kReceiveItem_Tab1[item] == 0) return false;
  if (GameHook_ReceiptShape(item, 0xff) != 0xff) return false;
  return HoldUpLive(item);
}

// The OAM palette row the hold-up draw of |item| uses: the gem's row while it shows,
// |native| (the item's own kWishPond2_OamFlags entry) otherwise.
uint8 GameHook_RupeeGemPalette(uint8 item, uint8 native) {
  uint8 gem_item, row;
  if (!HoldUpGemShown(item) || !GameHook_ColoredRupeeGem(item, &gem_item, &row)) return native;
  return row;
}

// The OAM size flag that draw uses, and whether it writes the second stacked entry: a
// narrow receipt's while the gem shows, |native| (kReceiveItem_Tab1) otherwise.
uint8 GameHook_RupeeGemShape(uint8 item, uint8 native) {
  return HoldUpGemShown(item) ? GEM_OAM_SIZE : native;
}

// The hold-up spawn of |item| computed a wide receipt's spot: moved to a narrow one's
// while the gem shows. The chest and the scripted presentations (item_receipt_method 1
// and 2) also place a narrow receipt two pixels lower than a wide one; the standing one
// does not.
void GameHook_RupeeGemSpawnOffset(uint8 item, int *x, int *y) {
  if (!HoldUpGemShown(item)) return;
  *x += GEM_SPAWN_DX;
  int method = item_receipt_method == 3 ? 0 : item_receipt_method;
  if (method != 0) *y += GEM_SPAWN_DY;
}

// Frame end (GameHook_ModuleFrameEnd): while a hold-up of a wide rupee receipt lives, the
// gem's current glint sheet over whatever the frame decoded into the slot, recoloured.
void GameHook_RupeeGemHoldUpFrameEnd(void) {
  if (!(enhanced_features3 & kFeatures3_ColoredRupees)) return;
  for (int k = 0; k < 10; k++) {
    if (ancilla_type[k] != ANCILLA_ITEM_RECEIPT) continue;
    uint8 item = ancilla_item_to_link[k];
    if (!HoldUpGemShown(item)) return;
    if (sign8(--ancilla_arr3[k])) {
      ancilla_arr1[k] = (uint8)((ancilla_arr1[k] + 1) % GEM_SHEET_COUNT);
      ancilla_arr3[k] = kGemGlintHold[ancilla_arr1[k]];
    }
    DecodeAnimatedSpriteTile_variable((uint8)(GEM_SHEET_FIRST + ancilla_arr1[k]));
    GameHook_RecolorRupeeGem(item);
    return;
  }
}
