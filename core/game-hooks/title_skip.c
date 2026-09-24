/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Title skip ───
// What a press does on the host's title. During the triangle animation it lands on the animation's
// end: the triangles at rest and the last step's exit taken, so the logo fade, the sword's drop with
// its flash and the lake fade play from there, the same state the sequence reaches on its own, so the
// host's mirror and the native title agree. A press while those fades play is spent. On the finished
// picture a confirm goes to the file select as always, and the cancel button starts the story at once
// instead of after the wait. Only while the host asked for its title (title_override.c); with that off
// Module00_Intro keeps its own skip.

// Where the three triangle pieces stop (kIntroSprite0_XLimit / YLimit).
static const uint8 kPieceRestX[3] = { 75, 95, 117 };
static const uint8 kPieceRestY[3] = { 88, 48, 88 };
// The zoom step starts the music at this distance.
enum { kMusicAtDistance = 113 };
// The sequence can be left for the finished picture once the poly thread and the pieces exist.
enum { kSkipFloor = 3 };
// The cancel button on the pad's high byte.
enum { kCancelButtons = 0x80 };
// The last submodule of the triangle animation; the logo fade follows it.
enum { kLastTriangleSubmodule = 4 };
enum { kFadeSteps = 31 };

int GameHook_TitleSkipFloor(void) {
  return TitleOverride_Hidden() ? kSkipFloor : 0;
}

static bool AtRest(void) {
  return submodule_index == 8 || (submodule_index == 7 && BYTE(palette_filter_countdown) == 0);
}

// The end of the triangle animation: the pieces at rest, then the last step's exit (Intro_RunStep
// case 4), from which the logo fade plays on its own.
static void ToAnimationEnd(void) {
  if (intro_step_index == 0 || (intro_step_index == 1 && poly_config1 > kMusicAtDistance)) music_control = 1;
  for (int k = 0; k < 3; k++) {
    intro_x_lo[k] = kPieceRestX[k];
    intro_x_hi[k] = 0;
    intro_y_lo[k] = kPieceRestY[k];
    intro_y_hi[k] = 0;
    intro_x_vel[k] = 0;
    intro_y_vel[k] = 0;
  }
  poly_a = 0;
  poly_b = 0;
  poly_config1 = 0;
  intro_step_index = 5;
  intro_step_timer = 0;
  intro_sprite_isinited[5] = 1;
  intro_sprite_subtype[5] = 3;
  TM_copy = 0x10;
  TS_copy = 5;
  CGWSEL_copy = 2;
  CGADSUB_copy = 0x31;
  subsubmodule_index = 0;
  flag_update_cgram_in_nmi++;
  nmi_load_bg_from_vram = 3;
  BYTE(palette_filter_countdown) = kFadeSteps;
  submodule_index = kLastTriangleSubmodule + 1;
}

// Intro_WaitPlayer's exit, taken now.
static void StartStory(void) {
  main_module_index = MODULE_ATTRACT;
  submodule_index = 0;
  BYTE(link_x_coord) = 0;
}

// The finished picture waits about eight seconds and then starts the story on its own. The host's
// title waits for the player instead: the countdown is pinned above zero at the end of every frame it
// would tick, so neither wait ever runs out and the story comes from the cancel button alone.
enum { kWaitHeld = 2 };

void GameHook_TitleHoldWait(void) {
  if (!TitleOverride_Hidden() || !AtRest()) return;
  subsubmodule_index = kWaitHeld;
}

bool GameHook_TitleSkip(void) {
  if (!TitleOverride_Hidden()) return false;
  if (submodule_index <= kLastTriangleSubmodule) {
    ToAnimationEnd();
    return true;
  }
  if (!AtRest()) return true;
  if (filtered_joypad_H & kCancelButtons) {
    StartStory();
    return true;
  }
  return false;
}
