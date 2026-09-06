/* @layer core-game-hooks @kind native */
// Contextual receipt messages — a one-shot message slot consumed by the item-receipt
// flow. The randomizer arms it (from TS per delivered grant, or natively per applied
// chest override / receipt-export grant) and the one vendored seam in ancilla.c, where
// the receipt's message id is chosen, asks GameHook_ReceiptMessageOverride whether to
// substitute. The setters only RECORD (same contract as item_overrides.c — the gate word
// latches into WRAM a frame after the host writes it, so testing it at record time would
// silently drop every arm made in the same burst); kFeatures3_ReceiptMessages is
// enforced at the application site alone.
#include "game_hooks_internal.h"

// The armed one-shot: a dialogue message index, or -1 for none. Consumed by every
// receipt that reaches the message seam, applied or not, so a stale arm can never leak
// into a later unrelated receipt.
static int g_next_receipt_msg = -1;
// True once a receipt has been created for the armed one-shot (Link_ReceiveItem ran
// after the arm). The arm belongs to THAT receipt from then on. A receipt does not
// always reach the seam: the vendored flow skips it in five rooms (ancilla.c, the shop
// rooms, where the message is suppressed) and a receipt with no free ancilla slot never
// runs at all. Without the claim such an arm stood until the next receipt anywhere and
// showed that receipt a line composed for another check. With it, a claimed arm is
// stale the moment another grant starts: the next arm replaces it, and the next receive
// with no arm of its own drops it.
static bool g_receipt_msg_claimed = false;

// One tier of a multi-tier upgrade family: blades 0x00-0x03 and the lone first blade
// 0x49, shields 0x04-0x06, the lift gloves 0x1b/0x1c, the armors 0x22/0x23 — or an
// unresolved progressive virtual id (a seam that arms its class line before resolving).
// Derivable from the receipt id alone.
static bool IsProgressiveItem(uint8 item_id) {
  return item_id <= 0x06 || item_id == 0x1b || item_id == 0x1c ||
         item_id == 0x22 || item_id == 0x23 || item_id == 0x49 ||
         GameHook_IsProgressiveVirtualId(item_id);
}

// Per-palace items: small key 0x24, the palace-bitmask trio 0x25/0x32/0x33.
static bool IsDungeonItem(uint8 item_id) {
  return item_id == 0x24 || item_id == 0x25 || item_id == 0x32 || item_id == 0x33;
}

static int ClassMessageFor(uint8 item_id, int fallback_msg) {
  if (IsProgressiveItem(item_id)) return kReceiptMsg_Progressive;
  if (IsDungeonItem(item_id)) return kReceiptMsg_DungeonItem;
  return fallback_msg;
}

void GameHook_ArmReceiptMessageIfClear(int msg) {
  if (!(enhanced_features3 & kFeatures3_ReceiptMessages)) return;
  if (g_next_receipt_msg != -1 && !g_receipt_msg_claimed) return;
  g_next_receipt_msg = msg;
  g_receipt_msg_claimed = false;
}

void GameHook_ArmReceiptClassMessage(uint8 item_id, int fallback_msg) {
  GameHook_ArmReceiptMessageIfClear(ClassMessageFor(item_id, fallback_msg));
}

// The progressive capacity resolver's arm (capacity_progressive.c): REPLACES whatever the
// seam armed for the location, because the jump — and so the line — is only known once
// the pickup resolves. Same gate as the if-clear arm.
void GameHook_ArmReceiptMessageReplace(int msg) {
  if (!(enhanced_features3 & kFeatures3_ReceiptMessages)) return;
  g_next_receipt_msg = msg;
  g_receipt_msg_claimed = false;
}

// Link_ReceiveItem ran: the receipt it created owns the armed one-shot. An arm a previous
// receipt already claimed never reached the seam, so it is dropped here rather than shown
// on this receipt. No gate test: with the gate off nothing is ever armed, so this is a
// no-op there, and the arm this clears could only exist with the gate on.
void GameHook_ReceiptMessageClaim(void) {
  if (g_receipt_msg_claimed) g_next_receipt_msg = -1;
  g_receipt_msg_claimed = g_next_receipt_msg != -1;
}

// The armed one-shot without consuming it (the headless probes).
int GameHook_PeekReceiptMessage(void) {
  return g_next_receipt_msg;
}

// Takes the one-shot for a seam that shows the line itself, because the receipt's own
// message seam never runs where its grant lands (the vendored receipt skips every shop
// room). Same gate and blob test as the override, -1 when nothing usable is armed, and
// consumed either way so a stale arm cannot leak into a later receipt.
int GameHook_TakeReceiptMessage(void) {
  int armed = g_next_receipt_msg;
  g_next_receipt_msg = -1;
  g_receipt_msg_claimed = false;
  if (armed < 0 || !(enhanced_features3 & kFeatures3_ReceiptMessages)) return -1;
  return DialogueLineExists(armed) ? armed : -1;
}

int GameHook_ReceiptMessageOverride(uint8 item_id, int vanilla_msg) {
  int armed = g_next_receipt_msg;
  g_next_receipt_msg = -1;
  g_receipt_msg_claimed = false;
  if (armed < 0) return vanilla_msg;
  if (!(enhanced_features3 & kFeatures3_ReceiptMessages)) return vanilla_msg;
  if (!DialogueLineExists(armed)) {
    printf("[Randomizer] Receipt message %d not in the dialogue blob (stale assets?) — keeping %d\n",
           armed, vanilla_msg);
    return vanilla_msg;
  }
  printf("[Randomizer] Receipt message: item=0x%02x msg %d -> %d\n", item_id, vanilla_msg, armed);
  return armed;
}

// No gate test here: records only, per the file comment. TS passes ids from
// RANDOMIZER_RECEIPT_MSG (randomizer-templates.ts), which mirrors kReceiptMsg_*.
EMSCRIPTEN_KEEPALIVE
void WasmSetNextReceiptMessage(int msg_id) {
  g_next_receipt_msg = msg_id;
  g_receipt_msg_claimed = false;
}
