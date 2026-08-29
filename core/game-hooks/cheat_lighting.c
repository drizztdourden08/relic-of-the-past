/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Always Illuminate Dark Rooms ───
//
// A dark room only lights up around the player when the game decides the lamp is in use, and the
// single thing that decision turns on is whether the item is owned: Hud_RestoreTorchBackground
// (hud.c) sets hdr_dungeon_dark_with_lantern and puts the mask layer on the subscreen, and bails
// out first thing if link_item_torch is clear. So the cheat is not a light of its own, it is that
// same pair of bytes asserted without the item. Everything downstream, the mask positioning, the
// color math, the transitions, is the vanilla path and never learns the difference.
//
// The writes go through ZeldaWriteCheatByte for the same reason the walk-through-walls byte does:
// these live in WRAM, a save-state load overwrites them wholesale, and only a recorded write keeps
// a replay reproducing frame for frame. Re-asserting every frame is what makes the cheat survive a
// load with no "reapply on restore" special case anywhere.

static bool g_wanted_illuminate;

static bool IlluminateArmed(void) {
  // No category bit of its own: lighting is not collision, items, stats or combat, so this tests
  // the master cheat switch directly, the same choice WasmCheatStartTrace makes. Vanilla Safe
  // strips that switch on the way into WRAM, so it disarms this too.
  return (enhanced_features3 & kFeatures3_CheatsEnabled) != 0 && g_wanted_illuminate;
}

// Whether this frame's cone state is ours to drive at all. Player in control of a dark indoor room,
// no torch lit (a lit torch lights the whole room, which is the game's own reason to drop the cone),
// and crucially no lamp owned: with the item the game already does the right thing every frame and
// fighting it could only ever make things worse. That last clause is also what makes the disarm
// safe, since a cone standing in a lampless dark room can only be one we raised.
static bool ConeIsOurs(void) {
  return main_module_index == MODULE_DUNGEON && submodule_index == 0
      && dung_want_lights_out != 0 && dung_num_lit_torches == 0 && link_item_torch == 0;
}

void CheatLighting_Sync(void) {
  if (!ConeIsOurs())
    return;
  if (IlluminateArmed()) {
    ZeldaWriteCheatByte(0x458, 1);  // hdr_dungeon_dark_with_lantern
    // bg2 property 2 is the one dark-room flavor the game leaves the subscreen alone for.
    if (dung_hdr_bg2_properties != 2)
      ZeldaWriteCheatByte(0x1D, 1);  // TS_copy
  } else if (hdr_dungeon_dark_with_lantern) {
    ZeldaWriteCheatByte(0x458, 0);
    if (dung_hdr_bg2_properties != 2)
      ZeldaWriteCheatByte(0x1D, 0);
  }
}

// ─── WASM Export ───

// Arm/disarm lighting dark rooms without the lamp. Sets the wanted state only, never pokes WRAM:
// CheatLighting_Sync() above is the single writer, so the cheat applies on the next frame boundary
// and a save-state load can never leave it half-applied.
EMSCRIPTEN_KEEPALIVE
void WasmCheatSetIlluminateDarkRooms(int on) {
  if (!(enhanced_features3 & kFeatures3_CheatsEnabled)) return;
  g_wanted_illuminate = on != 0;
  printf("[Cheat] SetIlluminateDarkRooms: %d\n", g_wanted_illuminate);
}
