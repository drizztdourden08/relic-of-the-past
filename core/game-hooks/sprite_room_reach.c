/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Sprite reach inside a room ───
//
// A sprite runs and draws only while it sits inside a window around the screen: 64px before the
// left and top edges, 48px past the right and bottom ones. Outside it the sprite is paused, which
// is how the original game keeps the far corners of a 512x512 room asleep. A configured wide view
// grows that window by twice the side budget on every frame, whatever the frame shows.
//
// Indoors the picture stops at the edge of the room section the camera is confined to, so a
// one-screen section shows no extra columns at all. The grown window still reached 2 x budget past
// it, into the neighbouring sections of the same room. Their sprites woke up behind the wall, and
// the ones that fly over walls crossed it: the fairies of the cave that shares a room with the
// Lake Hylia pond drifted into the black space beside the pond.
//
// With the gate on, an indoor sprite is measured against the original window grown by the columns
// and rows this frame really shows (g_render_extra_*, which ConfigurePpuSideSpace bounds by the
// section). A sprite past that is out of range, exactly as the original game treats a sprite past
// its own window. Every sprite the original game would run still runs, and a wide section still
// runs everything the wide picture shows.
//
// The overworld is left alone: an area has no walled sections, and its view is bounded by the area.
// Gated with the other corrections for a picture drawn assuming a 4:3 screen.
enum {
  kReachBefore = 0x40,
  kReachPast = 0x130,
  kSpriteIgnoresRowReach = 0x20,
};

bool GameHook_SpriteBeyondShownRoom(int k, int x, int y) {
  if (!(enhanced_features0 & kFeatures0_WidescreenVisualFixes) || !player_is_indoors)
    return false;
  if (!Wide_Active() && !Tall_Active())
    return false;
  if (x < -(kReachBefore + g_render_extra_left) || x >= kReachPast + g_render_extra_right)
    return true;
  if (sprite_flags4[k] & kSpriteIgnoresRowReach)
    return false;
  return y < -(kReachBefore + g_render_extra_top) || y >= kReachPast + g_render_extra_bottom;
}
