/* @layer core-game-hooks @kind native */
#ifndef GAME_HOOKS_HOST_GATES_H
#define GAME_HOOKS_HOST_GATES_H

#include "src/types.h"

// Gates for behaviour that never influences emulated state — host-side presentation, instrumentation
// and diagnostics. They live in a plain global rather than in WRAM, so they cost no save-state bytes
// and generate no replay-recorder traffic, and flipping one can never desynchronise a replay.
//
// A gate belongs here ONLY if the game core cannot observe it. Anything the C game code branches on
// must be a WRAM gate word (features.h) so it is captured in save states and replayed deterministically.
enum {
  kHostGateWordCount = 2,
};

// Bit assignment within g_host_gates[0]. No master switch like CheatGate's kFeatures3_CheatsEnabled —
// each bit names an independent host-only subsystem, not a user-facing cheat category.
enum {
  kHostGate_SimulatorSupport = 1,
};

extern uint32 g_host_gates[kHostGateWordCount];

// Out-of-range indices are ignored, so a renderer built against a newer gate catalog cannot corrupt
// memory when it talks to an older core.
void HostGates_SetWord(int index, uint32 value);
uint32 HostGates_GetWord(int index);

// True when |bit| is set in host-gate word 0. The single-condition helper every host-gated call site
// tests, mirroring CheatGate for the WRAM-side gates.
static inline bool HostGate(uint32 bit) {
  return (HostGates_GetWord(0) & bit) != 0;
}

#endif  // GAME_HOOKS_HOST_GATES_H
