/* @layer core-game-hooks @kind native */
// A dry run of the message: the pen the engine will drive, without drawing. Letters advance the pen by
// the font's width table, a line command moves it to that row, a scroll pushes every row up one and
// parks the pen on the last, the item picker lands its sprite on the last row. Nothing else moves it.
// Rows are never cleared by a key wait, so the most rows on screen is the most rows ever reached. The
// result is the mirror's message extent (dialog_mirror.c).
#include "game_hooks_internal.h"

enum { kDialogRows = 3 };
// The text area is 21 tiles wide; a pen past it is a row the engine itself would not show.
enum { kTextAreaWidthPx = 168 };
enum { kWideGlyphMask = 0x1ff,
       kNarrowGlyphMask = 0x7f,
       kWideUnknownWidth = 11 };
// Where RenderText_DrawSelectedYItem blits the 16 px item the picker shows, on the last row.
enum { kItemPickX = 104,
       kItemPickW = 16 };
// The loaded buffer is at most this long (Text_Initialize_initModuleStateLoop clears 0x7e0 bytes).
enum { kTextBufferBytes = 0x7e0 };

// The engine's own kTextCmd_* values (messaging.c), local to the vendored file.
enum {
  kCmd_Item = 2,
  kCmd_Scroll = 12,
  kCmd_Line1 = 13,
  kCmd_Line3 = 15,
  kCmd_EndMessage = 24,
  kCmd_IsLetter = 25,
};

// The decoder's packed word, as messaging.c's TEXTCMD_* macros unpack it: bit 0 says the command took
// a second byte, bits 1-5 are the command, the rest its parameter.
static uint8 CmdOf(uint32 packed) { return (packed >> 1) & 0x1f; }
static uint16 ParamOf(uint32 packed) { return (uint16)(packed >> 6); }
static uint8 MultibyteOf(uint32 packed) { return packed & 1; }

// The engine's command decoder (messaging.c, not in its header): the same call the pump makes.
uint32 Text_DecodeCmd(uint8 a, const uint8 *src);

void GameHook_DialogMeasure(void) {
  if (!DialogMirror_Recording()) return;
  // A Japanese set without the Japanese graphics pack has no font at all (JaGraphics_DialogueFontSync):
  // its letters advance the pen as far as the blank glyphs the draw leaves (dialog_wide_glyphs.c).
  MemBlk widths = FindIndexInMemblk(g_zenv.dialogue_font_blk, 1);
  const uint8 *buf = messaging_text_buffer;
  int pos = 0, line = 0, rows = 1, widest = 0;
  int pen[kDialogRows] = {0, 0, 0};
  while (pos < kTextBufferBytes) {
    uint32 packed = Text_DecodeCmd(buf[pos], &buf[pos + 1]);
    uint8 cmd = CmdOf(packed);
    if (cmd == kCmd_EndMessage) break;
    if (cmd == kCmd_IsLetter) {
      int c = ParamOf(packed);
      bool wide = (g_zenv.dialogue_flags & 4) != 0;
      size_t glyph = (size_t)(c & (wide ? kWideGlyphMask : kNarrowGlyphMask));
      pen[line] += glyph < widths.size ? widths.ptr[glyph] : (wide ? kWideUnknownWidth : 0);
      if (pen[line] > widest) widest = pen[line];
    } else if (cmd >= kCmd_Line1 && cmd <= kCmd_Line3) {
      line = cmd - kCmd_Line1;
      pen[line] = 0;
      if (line + 1 > rows) rows = line + 1;
    } else if (cmd == kCmd_Scroll) {
      pen[0] = pen[1];
      pen[1] = pen[2];
      pen[2] = 0;
      line = kDialogRows - 1;
      rows = kDialogRows;
    } else if (cmd == kCmd_Item) {
      if (kItemPickX + kItemPickW > widest) widest = kItemPickX + kItemPickW;
      rows = kDialogRows;
    }
    pos += 1 + MultibyteOf(packed);
  }
  DialogMirror_SetExtent((uint8)(widest > kTextAreaWidthPx ? kTextAreaWidthPx : widest), (uint8)rows);
}
