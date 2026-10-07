/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// Diagnostic: how many times each item id was actually handed over, and by which call site.
// Link_ReceiveItem is not idempotent, so a check granted twice really does give the item twice; this
// is how that gets caught instead of inferred. Counting lives here instead of beside the trigger
// logic because it observes grants without taking part in them.
uint16 g_receive_counts[256];
uint16 g_receive_by_site[4];

void SimCountReceive(uint8 site, uint8 item_id) {
  g_receive_counts[item_id]++;
  if (site < 4) g_receive_by_site[site]++;
}

// Read back by the simulator only, so both answer to the simulator's read gate.
EMSCRIPTEN_KEEPALIVE
int WasmGetReceiveCount(int item_id) {
  if (!SimQueryGate()) return 0;
  return (item_id >= 0 && item_id < 256) ? g_receive_counts[item_id] : -1;
}

EMSCRIPTEN_KEEPALIVE
int WasmGetReceiveSite(int site) {
  if (!SimQueryGate()) return 0;
  return (site >= 0 && site < 4) ? g_receive_by_site[site] : -1;
}
