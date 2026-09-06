/* @layer core-game-hooks @kind native */
// The max-wallet cheat. The wallet has no native cap table: its ceiling is the vanilla
// 999 (9999 under CarryMoreRupees) lowered by the hook-owned ladder (capacity_tiers.h)
// whenever a Custom wallet is armed. So "set max wallet" sets the RUNG the file stands
// on, the same persisted index a wallet upgrade climbs, and never a ceiling of its own:
// every reader (the HUD drain, the shop ceilings, the pickup bonus, the UI bridge) keeps
// asking GameHook_WalletMax, so the cheat cannot disagree with the ladder. Without a
// Custom wallet there is no ladder to stand on and the cheat refuses, the way GiveItem
// refuses outside gameplay: the native ceiling is a feature setting, not a cheat.
//
// Same wanted-capacity contract as SetMaxBombs (cheats.c): the caller asks for a count and
// the nearest rung wins, so 4999, 5000 and 5048 all land on rung 50. A count the file
// already carries above the new ceiling is cut to it at once, as the bomb cheat cuts its
// count; the vendored drain (hud.c Hud_RefillLogic) then holds the same ceiling frame by
// frame because it reads the same rung.
#include "game_hooks_internal.h"
#include "capacity_tiers.h"
#include "wallet_cheat.h"

// The rupee ceilings hud.c MaxRupees chooses between before the ladder lowers them.
#define RUPEE_CEILING 999
#define RUPEE_CEILING_EXTENDED 9999

// The ladder rung whose cap (100 * rung - 1) sits closest to |wanted|; a tie goes to the
// lower rung.
static int NearestWalletRung(int wanted) {
  return WalletLadderIndexClamp((wanted + WALLET_STEP_RUPEES / 2) / WALLET_STEP_RUPEES);
}

static int WalletCeiling(void) {
  int vanilla = (enhanced_features0 & kFeatures0_CarryMoreRupees) ? RUPEE_CEILING_EXTENDED : RUPEE_CEILING;
  return GameHook_WalletMax(vanilla);
}

EMSCRIPTEN_KEEPALIVE
void WasmCheatSetMaxWallet(int capacity) {
  if (!CheatGate(kFeatures3_CheatStats)) return;
  int rung = NearestWalletRung(capacity);
  if (!GameHook_WalletLadderSet(rung)) {
    printf("[Cheat] SetMaxWallet: blocked, no wallet ladder armed (ceiling stays %d)\n", WalletCeiling());
    return;
  }
  int cap = WalletCeiling();
  if (link_rupees_goal > cap) link_rupees_goal = (uint16)cap;
  if (link_rupees_actual > cap) link_rupees_actual = (uint16)cap;
  printf("[Cheat] SetMaxWallet: capacity=%d (rung %d)\n", cap, rung);
}
