/* @layer core-game-hooks @kind native */
// Headless probes for the three ponds' seams (pond_plan.c, pond_toss_draw.c and
// wish_pond_plan.c): what a node harness calls after WasmInitHeadless to prove they behave,
// gate on and gate off; the renderer never calls them. Gated on the REQUESTED
// developer-tools bit like capacity_probes.c and prize_probes.c, because the gate word only
// lands in WRAM inside the first frame such a harness runs.
//
// The harness stages the context itself through WRAM (the wallet, the capacity tiers, the
// throw counter) and reads the same bytes back through WasmProbeWramPtr; the exports here
// only run the seams a purchase would run. WasmProbePondSeam is the one with side effects:
// it runs the whole purchase resolution, message and all, so the harness saves and restores
// the module bytes around it.
#include "game_hooks_internal.h"
#include "src/sprite_main.h"

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

// Fill the pond's flying-gem slots with volley |volley| of |amount| and hand back how many
// gems it spawned (-1 past the last volley). The receipts themselves come back through
// WRAM (happiness_pond_item_to_link), which is how the harness sees that a volley carries
// each of its denominations instead of repeating its first one.
EMSCRIPTEN_KEEPALIVE
int WasmProbePondSpawnVolley(int amount, int volley) {
  return ProbeGate() ? GameHook_PondSpawnVolley(amount, volley) : -2;
}

// Run the wrap-up seam and hand back the immobilize flag it left, so the harness sees that
// a plan holds the player through the palette fade and that the gate down writes nothing.
EMSCRIPTEN_KEEPALIVE
int WasmProbePondHoldPlayer(void) {
  if (!ProbeGate()) return -2;
  GameHook_PondHoldPlayer();
  return flag_is_link_immobilized;
}

// The digits the vanilla cost prompt quotes, |vanilla| being the BCD byte the vendored
// line would have shown; the plan's own price when it fits the line's two digits.
EMSCRIPTEN_KEEPALIVE
int WasmProbePondCostDigits(int vanilla) {
  return ProbeGate() ? GameHook_PondCostDigits(vanilla) : -2;
}

// The award line a prize throw would show: the "more to come" one or the "that was the
// last" one, or -1 when the throw keeps the vanilla capacity question.
EMSCRIPTEN_KEEPALIVE
int WasmProbePondAwardMessage(void) {
  return ProbeGate() ? GameHook_PondAwardMessage() : -2;
}

// ─── The two item-throwing waters (wish_pond_plan.c, wish_pond_visit.c) ───
// The harness stages the room itself (player_is_indoors, dungeon_room_index) and reads the
// counters back through WasmProbeWramPtr, so these only run the seams a visit would run.

// Which water the player is standing in, or -1 outside both.
EMSCRIPTEN_KEEPALIVE
int WasmProbeWishPondHere(void) {
  return ProbeGate() ? GameHook_WishPondHere() : -2;
}

// The rung the next throw hands over; -1 with no plan open and once the ladder is spent.
EMSCRIPTEN_KEEPALIVE
int WasmProbeWishPondRungIndex(void) {
  return ProbeGate() ? GameHook_WishPondRungIndex() : -2;
}

// The held-item seam: 1 when a plan owns the water, so the fairy holds nothing up.
EMSCRIPTEN_KEEPALIVE
int WasmProbeWishPondHidesHeldItem(int k) {
  return ProbeGate() ? (GameHook_WishPondHidesHeldItem(k) ? 1 : 0) : -2;
}

// One tick of the vendored handler for sprite slot |k|, exactly as the sprite loop runs it, and
// the ai state it leaves behind. The harness stages the room, the sprite and the player and
// watches the messages, the grants and the inventory across a whole visit, so the seams are
// proved where they sit and not only where they are called from. It shows messages and moves
// the module, so the harness restores those bytes around it.
EMSCRIPTEN_KEEPALIVE
int WasmProbeWishPondTick(int k) {
  if (!ProbeGate()) return -2;
  Sprite_WishPond3(k);
  return sprite_ai_state[k];
}

// One tick of the rupee pond's vendored handler for sprite slot |k|, the twin of the wish pond
// tick above: the harness stages the room and the player and watches a whole purchase.
EMSCRIPTEN_KEEPALIVE
int WasmProbePondTick(int k) {
  if (!ProbeGate()) return -2;
  Sprite_HappinessPond(k);
  return sprite_ai_state[k];
}

// The branch seam: 1 when a plan owns the water and the vendored branch list is skipped.
EMSCRIPTEN_KEEPALIVE
int WasmProbeWishPondPlanTakes(void) {
  return ProbeGate() ? (GameHook_WishPondPlanTakes(0) ? 1 : 0) : -2;
}

// The demand armed on rung |rung| of pond |pond| (pond_demands.h keys, all three ponds),
// read-only: (kind << 24) | (native_id << 16) | amount, or 0 when the rung carries none.
EMSCRIPTEN_KEEPALIVE
int WasmProbePondDemand(int pond, int rung) {
  if (!ProbeGate()) return -2;
  PondDemand demand;
  if (!GameHook_PondDemand(pond, rung, &demand)) return 0;
  return (demand.kind << 24) | (demand.native_id << 16) | demand.amount;
}

// Whether the grant that just crossed was a rung's: what the receive seam reads to tell a
// planned reward from the item the fairy hands straight back (npc_overrides.c).
EMSCRIPTEN_KEEPALIVE
int WasmProbeWishPondRungInFlight(void) {
  return ProbeGate() ? (GameHook_WishPondRungInFlight() ? 1 : 0) : -2;
}
