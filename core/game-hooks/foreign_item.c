/* @layer core-game-hooks @kind native */
// The foreign item: a location whose item belongs to another player in an online multiworld.
// The host arms it in any substitution table like any other id, as FOREIGN_ITEM_ID. At the
// pickup the location behaves exactly as it would for a native item: the chest opens and its
// flag is written, the giver plays the hand-over, the drop or standing item is collected, the
// shelf is paid for, the location's completion is reported. The one difference is that
// nothing enters the inventory.
//
// How nothing enters it. The id resolves, at the last moment before the native receive flow,
// to a PRESENTATION receipt whose only goods are paid through GameHook_ReceiptPayout
// (upgrade_bonus.c): the magic refill 0x45. It writes no inventory byte when the receipt spawns
// (misc.c AncillaAdd_ItemReceipt: a negative value and no branch of its own), so the payout
// is its whole effect, and an armed foreign receipt is paid 0. The hold-up, the sound and
// the art are the presentation receipt's own. The line shown is the entry's own message id,
// through the one-shot every override already arms (receipt_messages.c).
//
// The arm is bound to the live hold-up: it is consumed by the payout, and a frame end that
// finds no receipt of the presentation item alive drops it (a receipt that never spawned, a
// save state loaded under it). It is session state and never saved.
//
// The ICON ids (FOREIGN_ICON_FIRST..FOREIGN_ICON_LAST) are the same foreign item, one per
// picture the host loaded (foreign_icon.c): id FOREIGN_ICON_FIRST + n is held up as picture n,
// the icon of the game the item belongs to. They behave exactly as the sentinel in every other
// respect; the plain sentinel keeps the presentation receipt's own art.
//
// Gate: kFeatures5_ApOnline. Clear, the sentinel and the icon ids are not grant ids at all:
// every bound check refuses them, the resolvers pass them through untouched and no arm is ever
// made, so each id reaches exactly the code it reached before this file existed.
#include "game_hooks_internal.h"

#define FOREIGN_ITEM_ID 0xFE
// The icon ids, in the free span above the prize ids (dungeon_item_ids.h leaves 0x82-0xBF free).
#define FOREIGN_ICON_FIRST 0xB0
#define FOREIGN_ICON_LAST 0xBF
// The hold-up receipt ancilla and the ancilla slot count (upgrade_bonus.c uses the same two).
#define ANCILLA_ITEM_RECEIPT 0x22
#define ANCILLA_COUNT 10

// The magic refill receipt, paid only through the payout seam.
#define FOREIGN_PRESENTATION 0x45

static bool g_armed = false;

static bool ForeignGate(void) {
  return (enhanced_features5 & kFeatures5_ApOnline) != 0;
}

static bool IsIconId(uint8 item) {
  return item >= FOREIGN_ICON_FIRST && item <= FOREIGN_ICON_LAST;
}

static bool IsForeignId(uint8 item) {
  return item == FOREIGN_ITEM_ID || IsIconId(item);
}

bool GameHook_IsForeignGrantId(uint8 item) {
  return IsForeignId(item) && ForeignGate();
}

// A setter that validates at arm time reads the host's requested word: the latched one only
// follows a frame later, and the session raises the gate in the same tick it arms the plan.
bool GameHook_ForeignSentinelRequested(uint8 item) {
  return IsForeignId(item) && (g_wanted_gate_words[5] & kFeatures5_ApOnline) != 0;
}

// The sentinel reaching a grant while the latched gate is clear: the grant hands over nothing.
bool GameHook_ForeignSentinelStranded(uint8 item) {
  return IsForeignId(item) && !ForeignGate();
}

int GameHook_ForeignIconOf(uint8 item) {
  return IsIconId(item) && ForeignGate() ? item - FOREIGN_ICON_FIRST : -1;
}

uint8 GameHook_ForeignPresentationOf(uint8 item) {
  return GameHook_IsForeignGrantId(item) ? FOREIGN_PRESENTATION : item;
}

uint8 GameHook_ResolveForeignItem(uint8 item) {
  if (!GameHook_IsForeignGrantId(item)) return item;
  g_armed = true;
  GameHook_ArmForeignIcon(GameHook_ForeignIconOf(item));
  printf("[Online] Foreign item 0x%02x picked up, presented as 0x%02x\n", item, FOREIGN_PRESENTATION);
  return FOREIGN_PRESENTATION;
}

bool GameHook_ForeignReceiptPaysNothing(uint8 item) {
  if (!g_armed || item != FOREIGN_PRESENTATION) return false;
  g_armed = false;
  return true;
}

static bool ArmedReceiptAlive(void) {
  for (int k = 0; k < ANCILLA_COUNT; k++) {
    if (ancilla_type[k] == ANCILLA_ITEM_RECEIPT && ancilla_item_to_link[k] == FOREIGN_PRESENTATION) return true;
  }
  return false;
}

void GameHook_ForeignItemFrameEnd(void) {
  if (!g_armed) return;
  if (ForeignGate() && ArmedReceiptAlive()) return;
  g_armed = false;
}

EMSCRIPTEN_KEEPALIVE
int WasmForeignItemId(void) {
  return FOREIGN_ITEM_ID;
}

EMSCRIPTEN_KEEPALIVE
int WasmForeignIconFirstId(void) {
  return FOREIGN_ICON_FIRST;
}
