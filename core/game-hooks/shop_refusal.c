/* @layer core-game-hooks @kind native */
// The lines a randomized shelf says. When the player cannot pay: one per currency, so a
// shelf priced in arrows, bombs, hearts or a bottled thing names what it wants. The
// vendored refusal names rupees, which is right for a rupee price and wrong for every
// other one, so a rupee price keeps the vendored line and nothing else does. When the
// player buys: the shop's thanks, over the hold-up. The vendored thanks name the shelf's
// own stock, which a randomized shelf is not selling, so the line here names nothing.
//
// The lines are randomizer template lines, positions 6-14 of the list the language bake
// appends after the canonical vanilla dialogue (shared/asset-extraction/text/data/
// randomizer-templates.ts). Same frozen contract kReceiptMsg_* and the archery refusal
// answer to: the order here MUST match that list. A blob baked before these lines existed
// stops short of them, and an index past its end would open an empty box, so a fallback
// is said instead. The refusal itself and the beep are the same either way.
//
// Nothing here is gated: it is only ever reached from the gated shelf seams in
// shop_overrides.c, so with the gate off the vendored spot runs byte for byte and this
// file is never entered.
#include "game_hooks_internal.h"
#include "shop_payment.h"

// The first refusal line's message id: position 6 of the template list.
#define SHOP_REFUSAL_MSG_FIRST (kReceiptMsgBase + 6)
// The purchase line: position 14, right after the eight refusals.
#define SHOP_PURCHASE_MSG (kReceiptMsgBase + 14)

// Template positions after SHOP_REFUSAL_MSG_FIRST. The five bottled ones follow the
// bottle-slot values the game stores (3 red, 4 green, 5 blue, 6 fairy, 7 bee), so a
// bottle price's own amount indexes them with no table of its own.
enum {
  kShopRefusal_Arrows = 0,
  kShopRefusal_Bombs = 1,
  kShopRefusal_Hearts = 2,
  kShopRefusal_Bottled = 3,
};

// The position of |currency|'s line, or -1 for rupees and for a value no line covers.
static int RefusalPosition(uint8 currency, uint16 amount) {
  switch (currency) {
  case kShopCurrency_Arrows: return kShopRefusal_Arrows;
  case kShopCurrency_Bombs: return kShopRefusal_Bombs;
  case kShopCurrency_Hearts: return kShopRefusal_Hearts;
  case kShopCurrency_Bottle:
    if (amount < SHOP_BOTTLE_RED_POTION || amount > SHOP_BOTTLE_BEE) return -1;
    return kShopRefusal_Bottled + (amount - SHOP_BOTTLE_RED_POTION);
  default: return -1;
  }
}

int ShopRefusalMessage(uint8 currency, uint16 amount, int vendored_msg) {
  int position = RefusalPosition(currency, amount);
  if (position < 0) return vendored_msg;
  int msg = SHOP_REFUSAL_MSG_FIRST + position;
  if (DialogueLineExists(msg)) return msg;
  printf("[Randomizer] Shop refusal line %d not in the dialogue blob (stale assets?), keeping %d\n",
         msg, vendored_msg);
  return vendored_msg;
}

int ShopPurchaseMessage(int fallback) {
  if (DialogueLineExists(SHOP_PURCHASE_MSG)) return SHOP_PURCHASE_MSG;
  printf("[Randomizer] Shop purchase line %d not in the dialogue blob (stale assets?), keeping %d\n",
         SHOP_PURCHASE_MSG, fallback);
  return fallback;
}

// Headless probe: the line a purchase would show over |fallback|, against the dialogue
// blob loaded right now. Same gate as the refusal probe below.
EMSCRIPTEN_KEEPALIVE
int WasmProbeShopPurchaseMessage(int fallback) {
  if ((g_wanted_gate_words[0] & kFeatures0_DeveloperTools) == 0) return -1;
  return ShopPurchaseMessage(fallback);
}

// Headless probe: the line a refusal of |currency| at |amount| would show, against the
// dialogue blob loaded right now. Gated on the REQUESTED developer-tools bit like every
// other probe (capacity_probes.c), because the gate word only lands in WRAM inside the
// first frame a harness runs.
EMSCRIPTEN_KEEPALIVE
int WasmProbeShopRefusalMessage(int currency, int amount, int vendored_msg) {
  if ((g_wanted_gate_words[0] & kFeatures0_DeveloperTools) == 0) return -1;
  return ShopRefusalMessage((uint8)currency, (uint16)amount, vendored_msg);
}
