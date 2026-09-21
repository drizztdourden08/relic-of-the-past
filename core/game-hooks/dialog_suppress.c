/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Message box ownership ───
// Which box the player sees is decided once, when a message opens, and held until it closes.
//
// The text engine puts its box on the text layer through the NMI upload, and the same upload path
// takes it off again at the end (RenderText_Draw_Finish). Withholding those uploads is how the host
// box and Skip Dialog keep the native box off screen, and the engine asks on every one of
// them, not once per message. That holds up only while the answer stands still.
//
// It does not stand still. Dialog Box and Skip Dialog are live settings: a player changing either
// with a box already on screen answers one way for the box's own tiles and the other way for its
// tear-down. The tear-down is the only write that ever clears those tiles, so a box drawn under
// "show" and torn down under "hide" stays on the text layer with nothing left that would write over
// it. Every later message is hidden too, so nothing ever repaints there and the frame sits in the
// scene for the rest of the session.
//
// Hiding therefore waits for the next message. Showing takes effect at once: a box that starts
// being drawn part way through is still torn down by that same message's tear-down.

// Whether the decision for the message now open has been taken, and what it was.
static bool g_decided;
static bool g_hidden;

// Called from GameHook_DialogCleared, before the mirror's own gate, so every message resets this
// whatever the feature words say. Text_Initialize_initModuleStateLoop is the one point all of them
// pass through, the game-over menu and the story crawl included.
void DialogSuppress_MessageStarted(void) {
  g_decided = false;
}

bool GameHook_DialogSuppressDraw(bool wanted) {
  if (!wanted) {
    g_decided = true;
    g_hidden = false;
    return false;
  }
  if (!g_decided) {
    g_decided = true;
    g_hidden = true;
  }
  return g_hidden;
}

bool DialogSuppress_NativeHidden(void) {
  return g_decided && g_hidden;
}
