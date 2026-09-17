/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Hide Space Beyond Walls ───
//
// The space past a room's walls is the ceiling: the Ceiling objects (dungeon.c, subtype 1 index 0
// and its long and diagonal variants) all paint the same tilemap word, and a room's default layout
// and its own objects lay that word everywhere the walls do not enclose. In a house, a cave or the
// sanctuary it is a blank tile in the palette's backdrop colour: the dark brown around the house, the
// dark green around the sanctuary, the dark blue in the frosty caves. The setting paints it pure black.
//
// The PPU does it by identity, not by colour: every frame the hide is on it gets the ceiling block's
// words (PpuSetHiddenTiles), draws a BG2 tile equal to one of them as the gap sentinel, and the
// BlackBackdrop flag renders the sentinel black. The first shape of this feature blacked a colour
// class instead, every BG2 pixel in the last palette, and that palette also holds the sanctuary's
// carpet and a cave's raised floor, both of which it erased. Latching the flag into the standing
// render flags also kept it painting on the overworld, where the same class is tree tops, bushes
// and the ground showing through terrain (issue #179). Now each frame decides for itself: with the
// request off nothing here reads the game, and PpuBeginDrawing resets the flags every frame.
//
// Yes means the frame shows a room. player_is_indoors is that exactly: Dungeon_LoadEntrance sets it
// inside the force-blank frame that swaps the overworld for the room, and LoadOverworldFromDungeon
// clears it inside the one that swaps the room back out. The module cannot say it: leaving a room
// runs the iris close under MODULE_SPOTLIGHT_CLOSE while the room is still on screen, so a module
// test dropped the black band for the whole fade. The byte is left standing on the file-select and
// attract screens after a quit or a death, which is what the module range below excludes.
//
// Palaces are left alone: a room whose floor sits on a translucent layer over the ceiling word would
// lose it. The game marks every room outside a palace with palace index 0xff. The sanctuary is the
// one room the game files under a palace (the sewers) that plays as a house, so it is named by room id.
static bool g_wanted_hide_space_beyond_walls;

void GameHook_SetHideSpaceBeyondWalls(bool enable) {
  g_wanted_hide_space_beyond_walls = enable;
}

static bool HideActive(void) {
  if (!g_wanted_hide_space_beyond_walls || !player_is_indoors) return false;
  int mod = main_module_index;
  if (mod == MODULE_MENU) mod = saved_module_for_menu;
  if (mod < MODULE_PRE_DUNGEON || mod >= MODULE_TRIFORCE_ROOM || mod == MODULE_ATTRACT) return false;
  return (uint8)cur_palace_index_x2 == 0xff || dungeon_room_index == ROOM_SANCTUARY;
}

int GameHook_HideSpaceBeyondWallsFill(const uint16 **words) {
  if (!HideActive()) return 0;
  *words = Dungeon_CeilingTileWords();
  return kCeilingBlockWords;
}

// Headless probe: what this frame would hand the PPU. [0] = word count (0 when nothing is hidden),
// [1..4] = the ceiling words. Gated on the developer-tools bit like the frame dump; off, 0 and nothing
// written. The renderer never calls this.
static uint16 g_hide_probe[1 + kCeilingBlockWords];

EMSCRIPTEN_KEEPALIVE
int WasmDevHideSpaceFill(void) {
  if (!(enhanced_features0 & kFeatures0_DeveloperTools)) return 0;
  const uint16 *words = NULL;
  int n = GameHook_HideSpaceBeyondWallsFill(&words);
  g_hide_probe[0] = (uint16)n;
  for (int i = 0; i < kCeilingBlockWords; i++) g_hide_probe[1 + i] = (i < n) ? words[i] : 0;
  return (int)(uintptr_t)g_hide_probe;
}
