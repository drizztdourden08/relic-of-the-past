/* @layer core-game-hooks @kind native */
// The cheat console's view of the capacity ladders: what the ceiling of bombs, arrows, the
// meter and the wallet can be in the mode the game is in, which rung each stands on, and a
// setter that lands a family on a rung. A vanilla file offers the native grids (and the one
// wallet ceiling it has); a randomized file under a capacity profile offers that profile's
// ladder, empty rung included. The ladder itself lives in capacity_profile.c; this file only
// exports it and trims what the family holds when its ceiling drops.
#include "game_hooks_internal.h"
#include "cheat_inventory.h"

bool CheatConsole_InPlay(void) {
  bool module = main_module_index == MODULE_DUNGEON || main_module_index == MODULE_OVERWORLD ||
                GameHook_IsOverworldSpecialArea();
  return module && submodule_index == 0;
}

// The family order of capacity_profile.c: 0 explosives, 1 projectiles, 2 meter, 3 wallet.
#define kCapacityFamilyCount 4

static bool ReadGate(void) {
  return (enhanced_features3 & kFeatures3_CheatsEnabled) != 0;
}

// The cap of |rung| for |kind| in the current mode, or -1 when the ladder does not offer it.
EMSCRIPTEN_KEEPALIVE
int WasmCheatCapacityRungCap(int kind, int rung) {
  if (!ReadGate() || kind < 0 || kind >= kCapacityFamilyCount) return -1;
  return GameHook_CapacityRungCap(kind, rung);
}

// The rung |kind| stands on, or -1 outside the gate.
EMSCRIPTEN_KEEPALIVE
int WasmCheatCapacityRung(int kind) {
  if (!ReadGate() || kind < 0 || kind >= kCapacityFamilyCount) return -1;
  return GameHook_CapacityRungNow(kind);
}

// The vanilla wallet ceiling the ladder is measured against, the expression hud.c writes.
static int WalletCeiling(void) {
  return GameHook_WalletMax((enhanced_features0 & kFeatures0_CarryMoreRupees) ? 9999 : 999);
}

// Trim what the family holds to its new ceiling, the way the native capacity cheats trim
// their counts, so the HUD drain has nothing to take on the next frame.
static void TrimToCeiling(int kind) {
  int cap = GameHook_CapacityRungCap(kind, GameHook_CapacityRungNow(kind));
  switch (kind) {
    case 0: if (cap >= 0 && link_item_bombs > cap) link_item_bombs = (uint8)cap; break;
    case 1: if (cap >= 0 && link_num_arrows > cap) link_num_arrows = (uint8)cap; break;
    case 2: {
      uint8 meter = GameHook_MagicCapacity();
      if (link_magic_power > meter) link_magic_power = meter;
      break;
    }
    case 3: {
      int ceiling = WalletCeiling();
      if (link_rupees_goal > ceiling) link_rupees_goal = (uint16)ceiling;
      if (link_rupees_actual > ceiling) link_rupees_actual = (uint16)ceiling;
      break;
    }
    default: break;
  }
}

// Land |kind| on |rung|, clamped to the ladder the mode offers. A native wallet has no rung
// to set and is refused.
EMSCRIPTEN_KEEPALIVE
void WasmCheatSetCapacityRung(int kind, int rung) {
  if (!CheatGate(kFeatures3_CheatStats)) return;
  if (kind < 0 || kind >= kCapacityFamilyCount) return;
  if (!CheatConsole_InPlay()) {
    printf("[Cheat] SetCapacityRung: refused outside play (module=%d sub=%d)\n", main_module_index, submodule_index);
    return;
  }
  if (!GameHook_CapacitySetRung(kind, rung)) {
    printf("[Cheat] SetCapacityRung: family %d has no rung to set\n", kind);
    return;
  }
  TrimToCeiling(kind);
  Hud_RefreshIcon();
  printf("[Cheat] SetCapacityRung: family=%d rung=%d\n", kind, GameHook_CapacityRungNow(kind));
}
