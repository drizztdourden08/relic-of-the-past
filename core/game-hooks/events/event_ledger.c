/* @layer core-game-hooks @kind native */
// The event ledger: one bit per event the game never records for itself, in the hook-owned save
// bytes (save_bytes.h SRM_EVENT_LEDGER). The battery save copies the bytes, a save state
// snapshots them, and a vanilla read of the file never looks at them.
//
// Every write is a test-and-set. A save-state rewind can put the game back on the very frame a
// trigger sits on, and the recorders run again; a bit that is already set costs nothing and
// changes nothing, so no recorder has to promise it fires once.
//
// Gated by kFeatures5_EventLedger: clear, no byte here is ever written, which is the byte-for-byte
// parity Vanilla Safe asks for. Reads are never gated: a bit that was recorded stays true for the
// tracker even if the session later stops recording.
#include "../game_hooks_internal.h"
#include "../save_bytes.h"
#include "event_ids.h"

#define srm_event_byte(i) (*(uint8*)(g_ram + SRM_EVENT_LEDGER + (i)))

static bool LedgerOn(void) {
  return (enhanced_features5 & kFeatures5_EventLedger) != 0;
}

void GameHook_RecordEvent(EventId id) {
  if (!LedgerOn() || (unsigned)id >= (unsigned)kEventCount) return;
  uint8 *byte = &srm_event_byte(id >> 3);
  uint8 mask = (uint8)(1u << (id & 7));
  if (*byte & mask) return;
  *byte |= mask;
}

bool GameHook_HasEvent(EventId id) {
  if ((unsigned)id >= (unsigned)kEventCount) return false;
  return (srm_event_byte(id >> 3) & (1u << (id & 7))) != 0;
}

// Read side for the host: the ledger bytes in place, so the tracker reads the same bits the game
// does. Ungated like the other flag pointers: the bytes are zero on any file that never recorded.
EMSCRIPTEN_KEEPALIVE
int WasmGetEventBytes(void) {
  return (int)(g_ram + SRM_EVENT_LEDGER);
}

EMSCRIPTEN_KEEPALIVE
int WasmGetEventByteCount(void) {
  return SRM_EVENT_LEDGER_COUNT;
}
