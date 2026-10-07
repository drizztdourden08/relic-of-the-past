/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Dialog glyphs ───
// What the host needs to paint the message box's words the way the game does: the active language's
// glyph sheet and width table, and the four colours the text layer draws with this frame. Reads only,
// behind the render-queries gate. The rows themselves come from the mirror (dialog_mirror.c).

// The active language's glyph sheet (which = 0: 256 tiles of 16 bytes, 2bpp, glyph c at tile
// (c & 0x70) * 2 + (c & 0xf) with its lower half 16 tiles on) or its width table (which = 1: one byte
// per glyph). A pointer into the loaded asset blob, so no copy and no lifetime beyond the session.
EMSCRIPTEN_KEEPALIVE
int WasmGetDialogFont(int which) {
  if (!RenderQueryGate() || (unsigned)which > 1) return 0;
  return (int)(intptr_t)FindIndexInMemblk(g_zenv.dialogue_font_blk, which).ptr;
}

EMSCRIPTEN_KEEPALIVE
int WasmGetDialogFontSize(int which) {
  if (!RenderQueryGate() || (unsigned)which > 1) return 0;
  return (int)FindIndexInMemblk(g_zenv.dialogue_font_blk, which).size;
}

// The four colours the text box is drawing with right now: BG palette |text_tilemap_cur| names
// (bits 10-12, palette 6 unless a [Color] command moved it), read from live CGRAM so the host paints
// the glyph sheet the way the game does this frame. Four SNES 15-bit words.
static uint16 g_text_palette[4];

EMSCRIPTEN_KEEPALIVE
int WasmGetDialogPalette(void) {
  if (!RenderQueryGate() || g_zenv.ppu == NULL) return 0;
  int palette = (text_tilemap_cur >> 10) & 7;
  for (int i = 0; i < 4; i++)
    g_text_palette[i] = g_zenv.ppu->cgram[palette * 4 + i];
  return (int)(intptr_t)g_text_palette;
}
