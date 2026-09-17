/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Dialog presence ───
// Whether a message is on screen, told from the engine itself instead of from which module runs it.
// Every caller drives the text engine through RenderText: a talk box and the save menu under the
// interface module, the respawn picker, the story crawl, the ending and the tower-top lines under
// their own modules. Each of them calls it every frame for as long as the message is up, so "the
// engine ran this frame" is the test that holds for all of them.
//
// Two callers stop running the engine while their words stay up. The story crawl before the title
// fades each picture out with its last lines on screen. The game-over menu writes its three lines in
// one frame and then only moves the fairy cursor. For both, the words count as up for as long as their
// module runs and their message is the one loaded.

// The main modules the game-over sequence and the story crawl run under (kMainRouting, misc.c).
enum { kModule_GameOver = 18, kModule_Attract = 20 };

static bool g_rendered_now;
static bool g_rendered_last;
// The module that loaded the current message, when it is one of the two that keep words up unrun.
static uint8 g_held_module;

void DialogPresence_MarkRendered(void) {
  g_rendered_now = true;
}

// Called once per frame after the module routing, so the latch covers exactly one frame of routing.
// Leaving the holding module ends the hold, so a later visit never shows the previous message.
void DialogPresence_FrameEnd(void) {
  g_rendered_last = g_rendered_now;
  g_rendered_now = false;
  if (g_held_module != 0 && main_module_index != g_held_module) g_held_module = 0;
}

void DialogPresence_MessageStarted(void) {
  bool holds = main_module_index == kModule_GameOver || main_module_index == kModule_Attract;
  g_held_module = holds ? main_module_index : 0;
}

bool DialogPresence_Active(void) {
  // Before the message is set up, the position and rows still belong to the previous one.
  if (messaging_module == 0) return false;
  return g_rendered_last || (g_held_module != 0 && main_module_index == g_held_module);
}
