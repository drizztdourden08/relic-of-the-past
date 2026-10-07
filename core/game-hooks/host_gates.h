/* @layer core-game-hooks @kind native */
#ifndef GAME_HOOKS_HOST_GATES_H
#define GAME_HOOKS_HOST_GATES_H

#include "src/types.h"

// Gates for host-side presentation, instrumentation and diagnostics, none of which influences
// emulated state. They live in a plain global and not in WRAM, so they cost no save-state bytes
// and generate no replay-recorder traffic, and flipping one can never desynchronise a replay.
//
// A gate belongs here ONLY if the game core cannot observe it. Anything the C game code branches on
// must be a WRAM gate word (features.h) so it is captured in save states and replayed deterministically.
enum {
  kHostGateWordCount = 2,
};

// Bit assignment within g_host_gates[0]. There is no master switch like CheatGate's
// kFeatures3_CheatsEnabled, because each bit names an independent host-only subsystem, not a
// user-facing cheat category.
//
// The two external-sound bits do NOT map one-to-one onto the three sound channels: ambient
// (kSoundChannel_Ambient / APUI01) has its own bit, while the two one-shot channels
// (kSoundChannel_Sfx1 / kSoundChannel_Sfx2, APUI02 / APUI03) share kHostGate_ExternalSfx. The game
// picks between those two by whichever is free, not by kind of sound, so they are one switch to a
// user and splitting them would only produce a setting that half-works. The mapping itself lives in
// kSoundChannelGate (sound_hooks.c).
enum {
  kHostGate_SimulatorSupport = 1,
  kHostGate_ExternalMusic = 2,
  kHostGate_ExternalAmbient = 4,
  kHostGate_ExternalSfx = 8,
  // Diagnostics only: report EVERY sound the game raises, claimed or not, without changing which
  // of them the chip still plays. Off, not one extra host-call is made.
  kHostGate_SoundTrace = 16,
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
