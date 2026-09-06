/* @layer core-game-hooks @kind native */
// The capacity pickup bonus. A capacity upgrade has no receipt of its own, so a virtual
// grant borrows a native pickup for the hold-up (ten bombs 0x31, ten arrows 0x44, the
// magic refill 0x45, fifty rupees 0x41) and, natively, that pickup's goods ride along:
// the pond arithmetic refills a counted family to its new cap and the receipt adds its
// ten on top, the refill adds a fixed 16 of the 128 meter, the rupee receipt a flat 50 —
// none of it scaled to the ceiling. This module replaces every one of those with the
// profile's own reading, per family: a percentage of the NEW ceiling, or, with the
// family's step base on, of the ceiling GAINED by this pickup. The amount is added to
// the counter the way the native goods were (the fillers and the rupee goal, so the
// HUD drains it in with the same tick and sound), and every drain stops at the cap, so
// a nearly full counter cannot overflow; at 0 the counter never moves and only the
// ceiling rises.
//
// Seams: a resolver captures the ceiling before its climb and arms the bonus after it
// (GameHook_UpgradeBonusCapture / Arm); the vendored payout sites ask
// GameHook_ReceiptPayout for the goods and get the armed amount for that one receipt,
// their own expression otherwise. The arm is bound to the live hold-up: the counted
// families pay out inside the spawn (misc.c), the meter and the wallet when the hold-up
// ends (ancilla.c), and a frame end that finds no receipt of the armed item alive
// drops the arm. Gate: kFeatures5_CapacityBonus AND an armed table; with either
// missing every payout site keeps its vendored expression byte for byte. The setters
// are record-only, the shared latching contract.
#include "game_hooks_internal.h"

#define BONUS_FAMILY_COUNT 4
#define BONUS_PERCENT_MAX 100
// The hold-up receipt ancilla.
#define ANCILLA_ITEM_RECEIPT 0x22
#define ANCILLA_COUNT 10
// The rupee ceilings hud.c MaxRupees chooses between before the wallet ladder lowers them.
#define RUPEE_CEILING 999
#define RUPEE_CEILING_EXTENDED 9999

enum { kFamily_Explosives, kFamily_Projectiles, kFamily_Meter, kFamily_Wallet };

static struct {
  uint8 armed;
  uint8 percent[BONUS_FAMILY_COUNT];
  uint8 step_base[BONUS_FAMILY_COUNT];
} g_bonus;

// The ceiling captured before a climb (-1 = nothing captured), and the refill the pond
// arithmetic would overwrite, put back so the bonus is the only goods handed over.
static int g_before_max = -1;
static uint8 g_before_filler;

// The receipt item a bonus is armed for (-1 = none) and its amount.
static int g_pending_item = -1;
static int g_pending_amount;

static bool BonusGate(void) {
  return (enhanced_features5 & kFeatures5_CapacityBonus) != 0 && g_bonus.armed;
}

// |family|'s ceiling right now, in counter units: the decimal caps of the counted
// families (0 on the empty rung), the meter's full value, the rupee ceiling the HUD
// drain stops at.
static int FamilyCeiling(int family) {
  if (family == kFamily_Explosives) return GameHook_CapacityMax(0, link_bomb_upgrades);
  if (family == kFamily_Projectiles) return GameHook_CapacityMax(1, link_arrow_upgrades);
  if (family == kFamily_Meter) return GameHook_MagicCapacity();
  int vanilla = (enhanced_features0 & kFeatures0_CarryMoreRupees) ? RUPEE_CEILING_EXTENDED : RUPEE_CEILING;
  return GameHook_WalletMax(vanilla);
}

static uint8 *CountedFiller(int family) {
  if (family == kFamily_Explosives) return &link_bomb_filler;
  if (family == kFamily_Projectiles) return &link_arrow_filler;
  return NULL;
}

void GameHook_UpgradeBonusCapture(int family) {
  if (!BonusGate() || family < 0 || family >= BONUS_FAMILY_COUNT) return;
  g_before_max = FamilyCeiling(family);
  uint8 *filler = CountedFiller(family);
  g_before_filler = filler ? *filler : 0;
}

void GameHook_UpgradeBonusArm(int family, uint8 presentation, bool climbed) {
  int before = g_before_max;
  g_before_max = -1;
  if (!BonusGate() || before < 0 || !climbed || family < 0 || family >= BONUS_FAMILY_COUNT) return;
  int after = FamilyCeiling(family);
  int base = g_bonus.step_base[family] ? after - before : after;
  if (base < 0) base = 0;
  int amount = (g_bonus.percent[family] * base + BONUS_PERCENT_MAX / 2) / BONUS_PERCENT_MAX;
  // The pond arithmetic refilled the counted family to its new cap: put the filler back
  // to what it was, so the bonus below is the only goods this pickup hands over.
  uint8 *filler = CountedFiller(family);
  if (filler) *filler = g_before_filler;
  g_pending_item = presentation;
  g_pending_amount = amount;
  printf("[Randomizer] Upgrade bonus armed: family %d %d%% of %s (%d -> %d) = %d for receipt 0x%02x\n", family,
         g_bonus.percent[family], g_bonus.step_base[family] ? "the step" : "the ceiling", before, after, amount,
         presentation);
}

int GameHook_ReceiptPayout(uint8 item, int native) {
  if (g_pending_item < 0 || item != g_pending_item || !BonusGate()) return native;
  g_pending_item = -1;
  return g_pending_amount;
}

static bool ArmedReceiptAlive(void) {
  for (int k = 0; k < ANCILLA_COUNT; k++) {
    if (ancilla_type[k] == ANCILLA_ITEM_RECEIPT && ancilla_item_to_link[k] == g_pending_item) return true;
  }
  return false;
}

void GameHook_UpgradeBonusFrameEnd(void) {
  g_before_max = -1;
  if (g_pending_item < 0) return;
  if (BonusGate() && ArmedReceiptAlive()) return;
  g_pending_item = -1;
}

// Record-only setters, the shared contract: nothing here tests a gate; the read side is
// reached only through the resolvers, themselves inside the gated grant seams.
EMSCRIPTEN_KEEPALIVE
void WasmSetCapacityBonus(int family, int percent, int step_base) {
  if (family < 0 || family >= BONUS_FAMILY_COUNT) return;
  g_bonus.armed = 1;
  g_bonus.percent[family] = (uint8)clampi(percent, 0, BONUS_PERCENT_MAX);
  g_bonus.step_base[family] = (uint8)!!step_base;
  printf("[Randomizer] Capacity bonus: family %d %d%% of %s\n", family, g_bonus.percent[family],
         g_bonus.step_base[family] ? "the step" : "the ceiling");
}

EMSCRIPTEN_KEEPALIVE
void WasmClearCapacityBonus(void) {
  memset(&g_bonus, 0, sizeof(g_bonus));
  g_before_max = -1;
  g_pending_item = -1;
  printf("[Randomizer] Cleared capacity bonus\n");
}
