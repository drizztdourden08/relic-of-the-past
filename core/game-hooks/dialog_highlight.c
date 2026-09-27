/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Dialog highlight ───
// Two text colours inside one message: the randomizer's composed lines mark an item name (primary) and
// a player name (secondary) with control bytes, and the words between them draw in the colour the host
// chose. Only session lines carry the bytes (session_dialogue.c), and they are read behind the
// receipt-messages gate that every session line already needs, so a baked message, or any message with
// the gate down, decodes and draws exactly as before.
//
// The bytes, per text encoding (dialogue_flags bit 0):
//   US: 0x80 end, 0x81 primary, 0x82 secondary. The US decoder has no command there.
//   EU: 0x87 then 0x50 end, 0x51 primary, 0x52 secondary. A sub-byte the EU decoder has no case for.
//
// The glyph sheet is 2 bpp and a letter uses index 1 for its edge and 2 for its body; index 3 is the
// text palette's spare, used only by a few picture glyphs. A highlighted letter has its body pixels
// moved from 2 to 3 right after the engine draws it, so its edge and every other letter stay put. The
// colour comes from the draw itself (dialog_highlight_draw.c): the primary sits in the text palette's
// spare entry, and the tiles holding a secondary letter borrow a spare BG3 palette that copies the text
// palette with the secondary in that entry. The highlight is undone after the draw, so the game's own
// palette and tilemap never see it.

enum { kUsHighlightByte = 0x80, kEuPrefix = 0x87, kEuSubHigh = 0x50 };
// messaging_buf: three text rows of 0x2a0 bytes, each a top and a bottom half of 21 tiles of 16 bytes.
enum { kRowBytes = 0x2a0, kHalfBytes = 0x150, kTileBytes = 16, kBufferBytes = 0x7e0 };

// Pushed by the host as SNES 15-bit words; these are the app's defaults snapped the same way.
static uint16 g_colors[2] = { 0x1e9c, 0x32cf };
// The span the pen is in, and whether this message opened any span at all.
static uint8 g_kind;
static bool g_used;
// Text-area tiles, 6 rows of 21, that hold a secondary letter.
static uint8 g_secondary[kHighlightTileRows][kHighlightTileCols];
// The glyph the engine is drawing, recoloured once it is down (GameHook_DialogGlyphDrawn).
static struct { bool pending; uint8 line, x, w; } g_glyph;

static bool HighlightGate(void) {
  return (enhanced_features3 & kFeatures3_ReceiptMessages) != 0;
}

// The decoder's packed word, as messaging.c's TEXTCMD_MK builds it.
static uint32 PackedCommand(uint8 kind, uint8 multibyte) {
  return (uint32)kind << 6 | kDialogCmd_Highlight << 1 | multibyte;
}

uint32 GameHook_DialogHighlightDecode(uint8 a, const uint8 *src) {
  if (!HighlightGate()) return 0;
  if ((g_zenv.dialogue_flags & 1) == 0) {
    if (a < kUsHighlightByte || a > kUsHighlightByte + kHighlightSecondary) return 0;
    return PackedCommand(a - kUsHighlightByte, 0);
  }
  if (a != kEuPrefix || (src[0] & 0xf0) != kEuSubHigh || (src[0] & 0xf) > kHighlightSecondary) return 0;
  return PackedCommand(src[0] & 0xf, 1);
}

void GameHook_DialogHighlightSet(uint8 kind) {
  g_kind = kind;
  if (kind != kHighlightEnd) g_used = true;
}

uint8 DialogHighlight_Kind(void) {
  return g_kind;
}

bool DialogHighlight_Used(void) {
  return g_used;
}

uint16 DialogHighlight_Color(uint8 kind) {
  return g_colors[kind == kHighlightSecondary ? 1 : 0];
}

bool DialogHighlight_SecondaryTile(int row, int col) {
  return row >= 0 && row < kHighlightTileRows && g_secondary[row][col] != 0;
}

// A glyph of width |w| at pen |x| on text row |line| is about to be drawn.
void DialogHighlight_GlyphAt(uint8 line, uint8 x, uint8 w) {
  if (g_kind == kHighlightEnd || line >= kHighlightTileRows / 2 || w == 0) return;
  g_glyph.pending = true;
  g_glyph.line = line;
  g_glyph.x = x;
  g_glyph.w = w;
  for (int col = x >> 3; col <= (x + w - 1) >> 3 && col < kHighlightTileCols; col++) {
    g_secondary[line * 2][col] = g_secondary[line * 2 + 1][col] = g_kind == kHighlightSecondary;
  }
}

// Body pixels (index 2) of the glyph just drawn become index 3, in both halves of its row.
void GameHook_DialogGlyphDrawn(void) {
  if (!g_glyph.pending) return;
  g_glyph.pending = false;
  uint8 *buf = (uint8 *)messaging_buf;
  for (int p = g_glyph.x; p < g_glyph.x + g_glyph.w; p++) {
    uint8 bit = 0x80 >> (p & 7);
    for (int half = 0; half < 2; half++) {
      int base = g_glyph.line * kRowBytes + half * kHalfBytes + (p >> 3) * kTileBytes;
      if (base + kTileBytes > kBufferBytes) continue;
      for (int r = 0; r < 8; r++) {
        uint8 *plane0 = &buf[base + r * 2];
        if ((plane0[1] & bit) && !(*plane0 & bit)) *plane0 |= bit;
      }
    }
  }
}

// A [Scroll] finished: every text row moved up one, which is two tile rows.
void DialogHighlight_Scrolled(void) {
  memmove(g_secondary[0], g_secondary[2], sizeof g_secondary - 2 * sizeof g_secondary[0]);
  memset(g_secondary[kHighlightTileRows - 2], 0, 2 * sizeof g_secondary[0]);
}

void DialogHighlight_Cleared(void) {
  g_kind = kHighlightEnd;
  g_used = false;
  g_glyph.pending = false;
  memset(g_secondary, 0, sizeof g_secondary);
}

// The two colours, SNES 15-bit. Stored whatever the gate says; they only draw behind it.
EMSCRIPTEN_KEEPALIVE
void WasmSetDialogHighlightColors(int primary, int secondary) {
  g_colors[0] = (uint16)(primary & 0x7fff);
  g_colors[1] = (uint16)(secondary & 0x7fff);
}
