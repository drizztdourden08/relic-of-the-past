/* @layer core-game-hooks @kind native */
// Read-only probes for the headless harness: a story gate's answer for a given vanilla value, and
// the counts the gates compute (story_events.c). Dev-tools gated like every other probe, and never
// wired into the renderer.
#include "game_hooks_internal.h"

static bool ProbeGate(void) {
  return (g_wanted_gate_words[0] & kFeatures0_DeveloperTools) != 0;
}

EMSCRIPTEN_KEEPALIVE
int WasmProbeStoryGate(int gate, int vanilla) {
  if (!ProbeGate()) return -1;
  return GameHook_StoryGate((StoryGate)gate, vanilla != 0) ? 1 : 0;
}

// The barrier's blow for sprite slot |k| when the table computed |dmg| (story_barrier.c).
EMSCRIPTEN_KEEPALIVE
int WasmProbeBarrierDamage(int k, int dmg) {
  if (!ProbeGate()) return -1;
  return GameHook_BarrierDamage(k, (uint8)dmg);
}

// 0 pendants held · 1 crystals held · 2 Light World dungeons cleared · 3 Dark World dungeons
// cleared · anything else: every dungeon with a reward cleared.
EMSCRIPTEN_KEEPALIVE
int WasmProbeStoryCount(int which) {
  if (!ProbeGate()) return -1;
  return GameHook_StoryCount(which);
}
