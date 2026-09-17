/* @layer core-game-hooks @kind native */
// The map screens and the player's palette.
//
// Both maps draw a head marker from the player sheet (a dedicated tile block, never the bunny) and
// load the mail palette for it. Two things follow from that. The marker is an ordinary OAM slot the
// player OAM builder never sees, so with a custom sheet it was drawn from the shared row in the stock
// colors; it is marked as the player's here so the PPU resolves it against the private bank. And the
// mail load leaves a bunny in mail colors once the map closes, in the stock game too (the dungeon map
// restores its palette by memcpy, which the private bank cannot follow). GameHook_MapClosed puts the
// right palette back: always for a custom sheet, and under kFeatures2_FixBunnyPaletteAfterMap for the
// stock one, so the gate off leaves the original behavior untouched.
#include "game_hooks_internal.h"
#include "src/load_gfx.h"

void GameHook_PlayerMapHeadDrawn(int slot) {
  if (!PlayerSprite_HasCustom() || slot < 0 || slot >= 128)
    return;
  g_oam_player[slot] = 1;
}

void GameHook_MapClosed(void) {
  if (PlayerSprite_HasCustom()) {
    PlayerSprite_RefreshPalette();
    return;
  }
  if ((enhanced_features2 & kFeatures2_FixBunnyPaletteAfterMap) && link_is_bunny_mirror)
    LoadGearPalettes_bunny();
}
