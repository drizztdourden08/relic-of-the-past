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

// ─── Host-data gates ───
// Exports that feed a HOST system rather than the game. None of them changes what the game computes,
// but "it only reads" is not a reason to skip a gate: each is a host feature consuming emulated state,
// so each answers to its own bit. Keeping them separate is what makes the granularity real — turning
// the tracker off must not take navigation down with it.
//
// Every one of these is a plain single-bit test, so a call site stays one condition. Where a query
// genuinely serves two systems the OR lives HERE, in a named helper, never at the call site.

static inline bool TrackerQueryGate(void) {
  return (enhanced_features3 & kFeatures3_TrackerQueries) != 0;
}

static inline bool NavQueryGate(void) {
  return (enhanced_features3 & kFeatures3_NavigationQueries) != 0;
}

static inline bool RenderQueryGate(void) {
  return (enhanced_features3 & kFeatures3_RenderQueries) != 0;
}

static inline bool OverlayQueryGate(void) {
  return (enhanced_features3 & kFeatures3_OverlayQueries) != 0;
}

static inline bool DeliveryQueryGate(void) {
  return (enhanced_features3 & kFeatures3_DeliveryQueries) != 0;
}

// The save-flag reads (progress, room, overworld) genuinely serve two masters: the tracker polls them
// for the player's checklist, and the simulator reads them while walking a route. Gating them on the
// simulator's half alone would silently kill the tracker for every player, which is the trap this
// helper exists to make impossible to fall into at a call site.
static inline bool FlagQueryGate(void) {
  return TrackerQueryGate() || NavQueryGate() || SimQueryGate();
}

#endif // GAME_HOOKS_INTERNAL_H
