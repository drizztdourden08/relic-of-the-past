/* @layer core-game-hooks @kind native */
// Receipt-flow grants for the randomizer delivery path. Both exports answer to
// kFeatures3_ReceiptExport (an independent gate, like kFeatures3_ItemOverrides — no
// CheatsEnabled dependency), enforced here at the application site. The delivery queue
// paces calls with WasmCanReceiveItem (cheats.c); each export re-checks the same
// conditions so a mistimed call can never fire the receipt flow into a menu, text box
// or cutscene state.
#include "game_hooks_internal.h"

// The same gameplay conditions WasmCanReceiveItem (cheats.c) reports, minus its
// DeliveryQueries gate — these exports answer to their own bit instead.
static bool CanRunReceiptNow(void) {
  bool in_gameplay = main_module_index == MODULE_DUNGEON || main_module_index == MODULE_OVERWORLD ||
                     GameHook_IsOverworldSpecialArea();
  // link_position_mode nonzero means an item-use handler (rod/cane/net/…) is mid-windup:
  // link_item_in_hand is still 0 and the handler state is still Ground, so without this a
  // grant fires on top of the live handler and parks an un-advanceable item-get message
  // over it (the apparent soft-lock in the barrier/cane report). Mirror of the guard in
  // WasmCanReceiveItem (cheats.c) that paces the queue.
  return in_gameplay && submodule_index == 0 && !flag_is_link_immobilized &&
         !link_item_in_hand && !link_position_mode;
}

// Give item |item_id| through the native receipt flow: the standing hold-up animation,
// the item sprite, the message and the inventory write all come from the game's own
// AncillaAdd_ItemReceipt path (via Link_ReceiveItem, method 0 — the standing/NPC
// presentation). Arms the class-default context message first (a one-shot the host set
// for this grant wins — see receipt_messages.c). Valid ids are 0-75 (0x4B): the receipt
// arrays are exactly 76 entries and anything past them corrupts g_ram.
//
// Returns 1 when the item was actually granted, 0 when the call was refused (gate not
// latched, invalid id, or the player cannot receive right now). The delivery queue
// reads this to requeue a refused entry instead of counting it as delivered — a silent
// void no-op here is exactly how a grant used to get lost mid-cutscene.
EMSCRIPTEN_KEEPALIVE
int WasmGrantItemWithReceipt(int item_id) {
  if (!(enhanced_features3 & kFeatures3_ReceiptExport)) return 0;
  // A prize crystal cannot ride the native crystal receipt from here: that receipt ends
  // ONLY by transmuting into the rising crystal, whose cutscene is a dungeon-exit sequence
  // with no meaning on the overworld. Banked directly instead, and reported as delivered so
  // the queue does not requeue it forever.
  if (GameHook_DeliverPrizeItem((uint8)item_id)) return 1;
  if ((uint8)item_id >= 76 && !GameHook_IsVirtualGrantId((uint8)item_id)) {
    printf("[Randomizer] ReceiptGrant: blocked — item_id 0x%02x exceeds max valid receipt ID (0x4B)\n",
           item_id);
    return 0;
  }
  if (!CanRunReceiptNow()) {
    printf("[Randomizer] ReceiptGrant: blocked — cannot receive now (module=%d submodule=%d)\n",
           main_module_index, submodule_index);
    return 0;
  }
  // A virtual upgrade id (0x50-0x61) resolves to its native presentation item here —
  // the counter arithmetic runs and the pond's own upgrade message is armed (winning
  // over the class default below via the if-clear contract). A progressive id
  // (0x62-0x66) resolves to the next tier's native id from live inventory.
  uint8 grant = GameHook_ResolveGrantItem((uint8)item_id);
  GameHook_ArmReceiptClassMessage(grant, kReceiptMsg_Delivered);
  item_receipt_method = 0;
  // A delivery carries an already-assigned item — the npc-override seam must not
  // re-substitute it (its table keys on vanilla ids, which an assigned id can collide with).
  GameHook_NpcOverrideBypassOnce();
  Link_ReceiveItem(grant, 0);
  printf("[Randomizer] Receipt grant: item=0x%02x\n", item_id);
  return 1;
}

// Grant |amount| capacity-upgrade steps for |kind| (0 = bombs, 1 = arrows), one pond
// visit per step (GameHook_CapacityStep, upgrade_grants.c — the pond handler's own
// arithmetic: the level index advances, the refill target and the message digits take
// the new maximum, and a step past the reachable bound pays the pond's 100-rupee
// consolation instead).
//
// Presentation: a capacity upgrade has no hold-up receipt of its own natively, so the
// closest native presentation is composed from two native pieces — a hold-up receipt of
// the matching ammo item (0x31 ten bombs / 0x44 ten arrows, the bomb/arrow gfx) with
// the pond's own upgrade message armed over it (0x96/0x97, new maximum substituted via
// [Number]; 0x98 when already maxed). The ammo the receipt itself adds only tops up the
// refill (it lands in the same filler the upgrade already filled, and the drain stops
// at the cap), so the net effect equals a pond visit. When kFeatures3_ReceiptMessages
// is off the receipt keeps the ammo item's own message — presentation only, the
// capacity arithmetic above is unaffected.
EMSCRIPTEN_KEEPALIVE
void WasmGrantCapacityUpgrade(int kind, int amount) {
  if (!(enhanced_features3 & kFeatures3_ReceiptExport)) return;
  if (kind != 0 && kind != 1) {
    printf("[Randomizer] CapacityGrant: blocked — invalid kind %d\n", kind);
    return;
  }
  if (!CanRunReceiptNow()) {
    printf("[Randomizer] CapacityGrant: blocked — cannot receive now (module=%d submodule=%d)\n",
           main_module_index, submodule_index);
    return;
  }
  int steps = clampi(amount, 1, 8);
  bool maxed_payout = false;
  for (int n = 0; n < steps; n++) maxed_payout |= GameHook_CapacityStep(kind);
  GameHook_ArmReceiptMessageIfClear(maxed_payout ? 0x98 : (kind == 0 ? 0x96 : 0x97));
  // The hold-up icon (upgrade_icon.c) only for a grant that climbed.
  GameHook_ArmUpgradeIcon(maxed_payout ? -1 : kind);
  item_receipt_method = 0;
  // Composed presentation of a host-decided upgrade — never a vanilla giver's grant.
  GameHook_NpcOverrideBypassOnce();
  Link_ReceiveItem(kind == 0 ? 0x31 : 0x44, 0);
  printf("[Randomizer] Capacity grant: kind=%d steps=%d maxed=%d\n", kind, steps, maxed_payout);
}
