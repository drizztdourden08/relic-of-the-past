/* @layer core-game-hooks @kind native */
// The retro bow: the bow stops eating ammunition and starts eating money.
//
// The reference randomizer patches this into the ROM as a "rupee bow" flag plus two
// cost bytes: the plain shot and the silver one (Rom.py 1452-1454), and every shot
// is paid for at the moment it is fired. There is no arrow counter to feed: the one
// purchase that survives is bought once, in a shop, and is what lets the bow fire at
// all (Shops.py set_up_shops). That purchase is placement, not behaviour, so it lives
// on the fill side; THIS file owns the behaviour it implies.
//
// THE QUIVER IS THE COUNTER. The patched game's own shot routine (retro.asm
// DecrementArrows) reads the arrow counter as the quiver: zero refuses the shot, and
// anything else lets the wallet be charged, the counter itself never moving. The quiver
// arrives as a single arrow, which is what makes the counter non-zero. So the
// counter keeps its native byte and its native HUD digits, and reads 01 for the whole
// game once the quiver is owned: no save byte of its own is needed, and nothing else
// feeds it because retro_drops.c turns every arrow that would have landed there into
// rupees, exactly as the reference does.
//
// TWO seams, both in the vendored bow handler (player.c LinkItem_Bow): the archery
// game's own ammunition top-up, and the branch that decides whether the arrow just
// spawned may stay. Gate off, or with no costs armed, both are the vendored expressions
// verbatim, so the handler behaves exactly as it shipped and not one byte outside it is
// touched.
//
// The wallet is charged through the shelf's own currency helpers (shop_payment.c)
// rather than by writing the counter here: paying is already a PURE test followed by
// a write that only runs after the test passed, which is precisely the shape a
// refusal needs. A refused shot spends nothing, and the caller cancels the arrow and
// plays the same empty-bow sound an out-of-ammunition shot always played.
//
// No save byte of its own, no WRAM of its own: the costs are session state the host
// re-arms, exactly like the override tables, so a save state carries no trace of it.
#include "game_hooks_internal.h"
#include "shop_payment.h"

// The armed costs. Recorded blind: the gate latches a frame after the host writes it
// (the SyncGateWords contract every override table shares), so it is enforced at the
// application site below and never here.
static struct {
  uint8 armed;
  // The next shot is one of the archery game's own, already paid for at its counter.
  uint8 archery_shot;
  uint16 wood_cost;
  uint16 silver_cost;
} g_retro_bow;

// The value link_item_bow carries once the bow has climbed to its silver rung; below
// it the plain shot is what leaves the string (hud.c writes 3/4 for silver, 1/2 for
// plain, and ancilla.c reads the same threshold to pick the arrow).
#define RETRO_SILVER_BOW_LEVEL 3

// A price above what a wallet could ever hold would make the bow unfirable rather
// than expensive; the vanilla ceiling is the most any file can carry.
#define RETRO_COST_CEILING 999

static bool RetroOpen(void) {
  return (enhanced_features3 & kFeatures3_RetroBow) != 0 && g_retro_bow.armed;
}

// The sibling files (retro_drops.c, retro_shelf.c) answer to the same two conditions,
// so the whole feature turns on and off as one thing.
bool GameHook_RetroBowActive(void) {
  return RetroOpen();
}

EMSCRIPTEN_KEEPALIVE
void WasmSetRetroBow(int wood_cost, int silver_cost) {
  g_retro_bow.armed = 1;
  g_retro_bow.wood_cost = (uint16)clampi(wood_cost, 0, RETRO_COST_CEILING);
  g_retro_bow.silver_cost = (uint16)clampi(silver_cost, 0, RETRO_COST_CEILING);
  printf("[Randomizer] Retro bow armed: plain %d, silver %d\n", g_retro_bow.wood_cost,
         g_retro_bow.silver_cost);
}

EMSCRIPTEN_KEEPALIVE
void WasmClearRetroBow(void) {
  memset(&g_retro_bow, 0, sizeof(g_retro_bow));
}

// What this shot takes out of the wallet.
static uint16 RetroShotCost(void) {
  return link_item_bow >= RETRO_SILVER_BOW_LEVEL ? g_retro_bow.silver_cost : g_retro_bow.wood_cost;
}

// The archery game's top-up, run just before each of its shots is spent: the vendored
// handler hands the counter two arrows so the shot it is about to take is free.
//
// Retro off: that write, unchanged. Retro on: the counter is the quiver and must not
// climb, so the shot is marked as the game's own instead and the spend below lets it
// through unpaid. The reference reaches the same place the long way round (retro.asm
// ArrowGame refunds the cost the shot is then charged); this skips the round trip, and
// the one case where the two differ, a shot with no quiver, refuses here with nothing
// moved where the reference would refuse having handed the refund over.
void GameHook_ArcheryShotAmmo(void) {
  if (!RetroOpen()) {
    link_num_arrows += 2;
    return;
  }
  g_retro_bow.archery_shot = 1;
}

// May the arrow that was just spawned stay? |vendored_ok| is the expression the bow
// handler always tested: an archery game that has not run dry, and an arrow left to
// spend.
//
// Retro off: the vendored branch, unchanged. Retro on: the counter is read as the
// quiver and never written, and the shot is paid for in rupees, or refused outright so
// the caller cancels it with nothing spent.
bool GameHook_BowShotSpend(bool vendored_ok) {
  if (!RetroOpen()) {
    if (!vendored_ok) return false;
    if (--link_num_arrows == 0)
      Hud_RefreshIcon();
    return true;
  }
  bool archery = g_retro_bow.archery_shot != 0;
  g_retro_bow.archery_shot = 0;
  if (link_num_arrows == 0) return false;
  if (archery) return true;
  uint16 cost = RetroShotCost();
  if (!ShopCanPay(kShopCurrency_Rupees, cost)) return false;
  ShopTakePayment(kShopCurrency_Rupees, cost);
  return true;
}

// Headless probe: the same seam a shot runs through, without a bow in hand. Gated on
// the REQUESTED developer-tools bit like every other probe (capacity_probes.c),
// because the gate word only lands in WRAM inside the first frame a harness runs.
EMSCRIPTEN_KEEPALIVE
int WasmProbeBowShotSpend(int vendored_ok) {
  if ((g_wanted_gate_words[0] & kFeatures0_DeveloperTools) == 0) return -1;
  return GameHook_BowShotSpend(vendored_ok != 0) ? 1 : 0;
}

// The archery game's top-up, as the handler runs it right before the spend above.
EMSCRIPTEN_KEEPALIVE
int WasmProbeArcheryShotAmmo(void) {
  if ((g_wanted_gate_words[0] & kFeatures0_DeveloperTools) == 0) return -1;
  GameHook_ArcheryShotAmmo();
  return 1;
}
