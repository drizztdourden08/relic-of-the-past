/* @layer core-game-hooks @kind native */
// Held-item receipt art guard. Opening any text box decompresses two legacy story
// sheets over the shared scratch buffer at 0x14000 (Text_Initialize ->
// Attract_DecompressStoryGFX; the output is never read in this port). The animated
// currency receipts (ids 0x34-0x36) re-expand their tiles from that scratch every few
// frames WITHOUT re-decompressing (ancilla.c:3589), so a box opened during their
// hold-up pose turns the held sprite to garbage from then on. The original game never
// shows a message for exactly those ids, so the conflict was unreachable until the
// randomizer armed a message for every grant.
//
// Repair, not prevention: while a message box coincides with a live hold-up receipt,
// re-decode the held item's tiles once per frame AFTER the module ran (the caller is
// GameHook_ModuleFrameEnd, invoked from Module_MainRouting before NMI uploads), so the
// staging slot the NMI mirrors is always freshly decoded regardless of which code
// path scribbled over the scratch that frame.
#include "game_hooks_internal.h"
#include "src/load_gfx.h"

void GameHook_ReceiptPoseGfxGuard(void) {
  if (!(enhanced_features3 & kFeatures3_ReceiptMessages)) return;
  if (main_module_index != 14) return;  // a message box is up
  for (int k = 0; k < 10; k++) {
    if (ancilla_type[k] != 0x22) continue;  // the hold-up receipt ancilla
    uint8 item = ancilla_item_to_link[k];
    if (item >= 76) return;
    // The animated currency trio cycles three sheets; follow the frame the ancilla's
    // own cycle counter picked so the sparkle keeps animating instead of freezing.
    uint8 gfx = (item >= 0x34 && item <= 0x36) ? (uint8)(0x24 + ancilla_arr1[k])
                                               : kReceiveItemGfx[item];
    if (gfx != 0xff)
      DecodeAnimatedSpriteTile_variable(gfx);
    // A capacity upgrade's icon rides the same slot; put it back over the fresh decode.
    GameHook_RepairUpgradeIcon();
    return;
  }
}
