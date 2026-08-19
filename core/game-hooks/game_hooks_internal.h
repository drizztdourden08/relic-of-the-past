/* @layer core-game-hooks @kind native */
#ifndef GAME_HOOKS_INTERNAL_H
#define GAME_HOOKS_INTERNAL_H

#include "game_hooks.h"
#include <stdio.h>
#include <string.h>
#include <emscripten.h>
#include "src/variables.h"
#include "src/assets.h"
#include "src/zelda_rtl.h"
#include "src/config.h"
#include "src/hud.h"
#include "src/overworld.h"
#include "src/dungeon.h"
#include "src/misc.h"
#include "src/messaging.h"
#include "snes/ppu.h"

#include "game_constants.h"
#include "num_util.h"
#include "wasm_buf.h"
#include "host_gates.h"

// Forward-declare Link_ReceiveItem from player.c
extern void Link_ReceiveItem(uint8 item, int chest_position);

// True when the master cheat switch (kFeatures3_CheatsEnabled) AND |bit| are both set in features3.
// Every WasmCheat* export and cheat accessor tests this instead of a bare enhanced_features3 check, so
// turning cheats off silences every category in one place and a call site never needs "A && B".
static inline bool CheatGate(uint32 bit) {
  return (enhanced_features3 & kFeatures3_CheatsEnabled) != 0 && (enhanced_features3 & bit) != 0;
}

// The simulator's read side: developer mode alone. The Location & Navigation widget inspects sim
// state (chests, doors, sprite spawns, cell locks) outside of a run as well as during one, so this
// cannot also require kHostGate_SimulatorSupport — that bit is armed only for the run's lifetime.
static inline bool SimQueryGate(void) {
  return (enhanced_features0 & kFeatures0_DeveloperTools) != 0;
}

// The simulator's write side: developer mode AND the run-scoped host gate. Dev mode is the standing
// permission (matches every other dev-only surface); the host gate additionally confines mutation to
// an actual armed run, so merely toggling dev mode on in a live session can't move doors or kill
// enemies underfoot.
static inline bool SimMutateGate(void) {
  return SimQueryGate() && HostGate(kHostGate_SimulatorSupport);
}

// Check-trigger grants answer to TWO callers holding different permissions: the cheat UI, and the
// simulator walking a route headlessly. On the cheat bit alone a sim run silently produced wrong
// results whenever cheats were off — grants no-opped while the run still reported success. Resolved
// once here so each call site stays a single condition. The simulator half is SimMutateGate rather
// than a bare HostGate check so a check-trigger grant answers to the same dev-mode + run-scope
// requirement as every other WasmSim* mutator, now that the simulator sits behind developer mode.
static inline bool TriggerGrantAllowed(void) {
  return CheatGate(kFeatures3_CheatItemGrant) || SimMutateGate();
}

#endif // GAME_HOOKS_INTERNAL_H
