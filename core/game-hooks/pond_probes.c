/* @layer core-game-hooks @kind native */
// Headless probes for the rupee pond's seams (pond_plan.c, pond_toss_draw.c) — what a node
// harness calls after WasmInitHeadless to prove they behave, gate on and gate off; the
// renderer never calls them. Gated on the REQUESTED developer-tools bit like
// capacity_probes.c and prize_probes.c, because the gate word only lands in WRAM inside the
// first frame such a harness runs.
//
// The harness stages the context itself through WRAM (the wallet, the capacity tiers, the
// throw counter) and reads the same bytes back through WasmProbeWramPtr; the exports here
// only run the seams a purchase would run. WasmProbePondSeam is the one with side effects:
// it runs the whole purchase resolution, message and all, so the harness saves and restores
// the module bytes around it.
#include "game_hooks_internal.h"

static bool ProbeGate(void) {
  return (g_wanted_gate_words[0] & kFeatures0_DeveloperTools) != 0;
}

// The throw about to be paid for; -1 with no plan open.
EMSCRIPTEN_KEEPALIVE
int WasmProbePondThrowIndex(void) {
  return ProbeGate() ? GameHook_PondThrowIndex() : -2;
}

// What the pond asks for now; |vanilla| back with no plan open.
EMSCRIPTEN_KEEPALIVE
int WasmProbePondThrowCost(int vanilla) {
  return ProbeGate() ? GameHook_PondThrowCost(vanilla) : -2;
}

// The rupees the payment seam really takes; |stored| back with no plan open.
EMSCRIPTEN_KEEPALIVE
int WasmProbePondThrowAmount(int stored) {
  return ProbeGate() ? GameHook_PondThrowAmount(stored) : -2;
}

// What the throw puts in the pond's bank; |amount| back with no plan open.
EMSCRIPTEN_KEEPALIVE
int WasmProbePondPoolAdd(int amount) {
  return ProbeGate() ? GameHook_PondPoolAdd(amount) : -2;
}

// How long the purchase waits; |vanilla| back with no plan open.
EMSCRIPTEN_KEEPALIVE
int WasmProbePondTossDelay(int vanilla) {
  return ProbeGate() ? GameHook_PondTossDelay(vanilla) : -2;
}

// The refusal line: the closing line once the pond is exhausted, |vanilla| back while a
// throw is still on the table (a wallet too light for it keeps the vanilla refusal).
EMSCRIPTEN_KEEPALIVE
int WasmProbePondLaterMessage(int vanilla) {
  return ProbeGate() ? GameHook_PondLaterMessage(vanilla) : -2;
}

// Resolve the paid throw and advance the counter: ((prize + 1) << 16) | refund, or -1 when
// no plan owns it. The counter advance is the whole anti-farm property, so the harness
// calls this in sequence and watches the save byte climb.
EMSCRIPTEN_KEEPALIVE
int WasmProbePondTakeThrow(void) {
  if (!ProbeGate()) return -2;
  int prize = -1, refund = 0, consolation = -1;
  if (!GameHook_PondTakeThrow(&prize, &refund, &consolation)) return -1;
  return ((prize + 1) << 16) | (refund & 0xffff);
}

// The consolation line of the throw about to be resolved, WITHOUT resolving it: the
// counter stays put, so the harness can read the line and then take the throw. -1 = the
// vanilla consolation, -3 = no plan owns this throw.
EMSCRIPTEN_KEEPALIVE
int WasmProbePondConsolationMessage(void) {
  if (!ProbeGate()) return -2;
  return GameHook_PondConsolationMessage();
}

// The whole purchase seam for side |kind| (0 explosives, 1 projectiles), exactly as the
// handler runs it. True when the pond owned the purchase. Shows a message and can start a
// receipt, so the harness restores the module bytes afterwards.
EMSCRIPTEN_KEEPALIVE
int WasmProbePondSeam(int kind) {
  return ProbeGate() ? (GameHook_OverrideCapacityGrant(kind) ? 1 : 0) : -2;
}

// The receipt id of gem |index| of |amount|'s decomposition, largest first; -1 past the
// last gem. Pure, so it can be pinned against the same decomposition in TypeScript.
EMSCRIPTEN_KEEPALIVE
int WasmProbePondGemAt(int amount, int index) {
  return ProbeGate() ? GameHook_PondGemAt(amount, index) : -2;
}
