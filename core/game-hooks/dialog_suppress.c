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

// ─── Repair ───
// A state saved while a box was stranded carries those tiles in its own VRAM, so the frame comes back
// with it however the core that loads it behaves. The box is told from the room by tile identity: the
// engine's own border tiles sitting on the text layer with no message running is a box nothing is going
// to take down. Filling it with the blank the engine fills is what its tear-down would have written.
//
// The tiles and the fill are kText_BorderTiles (messaging.c), copied here because that table is file
// private to the vendored decompilation. Corners and edges only; the table's middle entry IS the fill.
static const uint16 kBoxBorderTiles[8] = {
  0x28f3, 0x28f4, 0x68f3, 0x28c8, 0x68c8, 0xa8f3, 0xa8f4, 0xe8f3,
};
// The fill and the span of RenderText_Draw_Finish's own tear-down stripe (0x2E42 words of 0x387F).
enum { kBoxBlankTile = 0x387f, kBoxWords = 280, kVramWords = 0x8000 };

static bool IsBoxBorderTile(uint16 tile) {
  for (int i = 0; i < 8; i++)
    if (tile == kBoxBorderTiles[i]) return true;
  return false;
}

void DialogSuppress_RepairStrandedBox(void) {
  if (messaging_module != 0 || g_zenv.ppu == NULL) return;
  if ((unsigned)text_msgbox_topleft + kBoxWords > kVramWords) return;
  uint16 *box = &g_zenv.ppu->vram[text_msgbox_topleft];
  bool stranded = false;
  for (int i = 0; i < kBoxWords && !stranded; i++)
    stranded = IsBoxBorderTile(box[i]);
  if (!stranded) return;
  for (int i = 0; i < kBoxWords; i++)
    box[i] = kBoxBlankTile;
}
