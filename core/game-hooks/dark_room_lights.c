/* @layer core-game-hooks @kind native */
// Which carried items light an unlit room.
//
// The game asks that once, in hud.c Hud_RestoreTorchBackground, and the whole of the question is
// whether the lamp is owned: with it, the dark-room byte and the subscreen layer go on and the cone
// follows the player; without it the function returns and the room stays black. Everything after
// that point (where the cone sits, the colour math, what a transition does with it) reads those two
// bytes and never learns which item put them there. So a second light is not a light of its own, it
// is that same ownership test answering yes for one more inventory byte.
//
// Possession is the entire rule. Nothing here charges the meter, waits for a button, or asks for an
// item to be held up, because the lamp does none of those either: its meter cost is charged for
// setting a torch alight, not for the cone, so a file on the meter's empty rung still sees by it.
// A ticked light is meant to behave exactly as the lamp does, and behaving exactly as the lamp does
// means costing nothing.
//
// Like the item-power switches beside them, the bits live in the WRAM gate word kRam_Features4
// rather than in a host gate, because the GAME branches on them: a host gate would be invisible to
// a save state and would desynchronise a replay (host_gates.h states that rule).
//
// The one function below is phrased as a DIVERGENCE, so with features4 clear it returns exactly the
// expression the vendored call site used to compute inline. That is the invariant to check when
// reading this file: with the word clear, this IS the lamp test and nothing else.
#include "game_hooks_internal.h"

static bool DarkRoomLightBit(uint32 bit) {
  return (enhanced_features4 & bit) != 0;
}

// hud.c Hud_RestoreTorchBackground: the "a light is carried" half of its refusal. The vendored
// expression is the lamp byte alone, returned untouched; each bit adds one more carried item beside
// it. The lamp itself carries no bit and is never taken away, so the worst a cleared word can do is
// leave the room lit by the item the game always lit it with.
bool GameHook_CarriesDarkRoomLight(void) {
  if (link_item_torch)
    return true;
  if (DarkRoomLightBit(kFeatures4_RodLightsDarkRoom) && link_item_fire_rod)
    return true;
  if (DarkRoomLightBit(kFeatures4_MedallionLightsDarkRoom) && link_item_bombos_medallion)
    return true;
  return DarkRoomLightBit(kFeatures4_RedCaneLightsDarkRoom) && link_item_cane_somaria != 0;
}

// Headless probe: the vendored seam itself, run on demand. Nothing is staged or read here, so
// the harness owns both sides of the observation — it writes the room bytes and the inventory it
// wants to ask about, calls this, and reads the dark-room byte and the subscreen flag the seam
// left behind. Gated on the REQUESTED developer-tools bit like every other probe
// (capacity_probes.c), because the gate word only lands in WRAM inside the first frame a harness
// runs. Returns 1 when the seam ran, -1 when the gate refused it.
EMSCRIPTEN_KEEPALIVE
int WasmProbeRestoreTorchBackground(void) {
  if ((g_wanted_gate_words[0] & kFeatures0_DeveloperTools) == 0) return -1;
  Hud_RestoreTorchBackground();
  return 1;
}
