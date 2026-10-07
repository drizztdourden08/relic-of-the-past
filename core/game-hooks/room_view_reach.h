/* @layer core-game-hooks @kind native */
// How far a wide view reaches inside a room: when it must collapse to the base frame, and which
// enemies it lets count toward a cleared screen. game_hooks.h includes it so the vendored callers
// in zelda_rtl.c and sprite.c can ask.
#ifndef GAME_HOOKS_ROOM_VIEW_REACH_H
#define GAME_HOOKS_ROOM_VIEW_REACH_H

#include "src/types.h"

// True while the lamp's light-cone mask is on the subscreen, so the extended view must collapse to
// the base frame: the mask only covers 256 pixels and its tilemap wraps, so any extra width samples
// a second, undarkened copy of the cone. Covers the room-transition frames where the game clears
// hdr_dungeon_dark_with_lantern while the mask is still being drawn. Wide view only. (view_gates.c)
bool GameHook_LightConeSuppressesExtraWidth(void);

// True when an enemy at screen position |x|,|y| keeps the screen from reading as clear under the
// widescreen play area. Indoors the original 256px square grows only by the columns of the current
// room section the view can show, so an enemy past the section's wall never counts. On the
// overworld it grows by the full side budget. Called only from the widescreen play area branch of
// Sprite_CheckIfScreenIsClear; the original test is untouched. (room_clear_reach.c)
bool GameHook_EnemyCountsTowardClear(int x, int y);

#endif  // GAME_HOOKS_ROOM_VIEW_REACH_H
