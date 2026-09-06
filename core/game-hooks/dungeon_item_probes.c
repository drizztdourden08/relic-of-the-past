/* @layer core-game-hooks @kind native */
// Headless probes for the targeted dungeon-item seams (dungeon_item_grants.c) — what a node
// harness calls after WasmInitHeadless to watch a grant arm and be consumed; the renderer
// never calls them. Gated on the REQUESTED developer-tools bit like prize_probes.c, because
// the gate word only lands in WRAM inside the first frame such a harness runs.
//
// The grant itself is driven through the real export (WasmGrantItemWithReceipt), so what the
// harness proves is the whole chain — resolver, receive flow, the two seams inside the
// receipt — rather than a re-implementation of it. These two reads only make the step
// between them observable.
#include "game_hooks_internal.h"

static bool ProbeGate(void) {
  return (g_wanted_gate_words[0] & kFeatures0_DeveloperTools) != 0;
}

// The palace a receipt in flight will credit, -1 for none.
EMSCRIPTEN_KEEPALIVE
int WasmProbeDungeonItemPalace(void) {
  return ProbeGate() ? GameHook_PendingDungeonItemPalace() : -2;
}

// The native item a targeted id draws and grants as — the draw seams' own lookup.
EMSCRIPTEN_KEEPALIVE
int WasmProbeDungeonItemPresentation(int item) {
  return ProbeGate() ? GameHook_DungeonItemPresentationOf((uint8)item) : -1;
}
