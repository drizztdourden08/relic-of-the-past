/* @layer core-game-hooks @kind native */
// Headless probes for the dungeon prize seams (prize_grants.c) — what a node harness calls
// after WasmInitHeadless to prove they behave, gate on and gate off; the renderer never
// calls them. Gated on the REQUESTED developer-tools bit like capacity_probes.c, because
// the gate word only lands in WRAM inside the first frame such a harness runs.
//
// The harness stages the context itself through WRAM (the room, the palace index, the
// receipt method) and reads the save bytes back through the same pointer; these exports
// only run the seams a grant would run, with no receive flow behind them.
#include "game_hooks_internal.h"

static bool ProbeGate(void) {
  return (g_wanted_gate_words[0] & kFeatures0_DeveloperTools) != 0;
}

// The claimed mask: palaces 0-7 low, 8-15 high.
EMSCRIPTEN_KEEPALIVE
int WasmProbePrizeTakenMask(void) {
  if (!ProbeGate()) return -1;
  return GameHook_PrizeTakenMask();
}

// The crystal the receipt in flight will bank, 0 for none.
EMSCRIPTEN_KEEPALIVE
int WasmProbePendingCrystal(void) {
  return ProbeGate() ? GameHook_PendingPrizeCrystal() : -1;
}

// The claimed test the two boss room tags run, for the palace currently staged.
// |vanilla_flagged| is the caller-side bit test they pass in.
EMSCRIPTEN_KEEPALIVE
int WasmProbeDungeonPrizeTaken(int vanilla_flagged) {
  return ProbeGate() ? (GameHook_DungeonPrizeTaken(vanilla_flagged) ? 1 : 0) : -1;
}

// The whole substitution seam a falling reward crosses: the armed npc table is matched in
// the staged context, the dungeon is marked claimed, and the assigned id resolves exactly
// as it would on its way into the receive flow. Returns the resolved native id.
EMSCRIPTEN_KEEPALIVE
int WasmProbeNpcGrant(int vanilla_item) {
  return ProbeGate() ? GameHook_OverrideNpcGrantItem((uint8)vanilla_item) : -1;
}

// The draw-side answer for the same context — what the falling reward renders as.
EMSCRIPTEN_KEEPALIVE
int WasmProbePeekNpcGrant(int vanilla_item) {
  return ProbeGate() ? GameHook_PeekNpcGrantItem((uint8)vanilla_item) : -1;
}
