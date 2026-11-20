/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Dialog wide glyphs (Japanese dialogue) ───
// A Japanese set (dialogue_flags bit 4) spells every letter as a byte pair [0x88 + (g >> 8), g & 0xFF],
// g the glyph 0-511, and draws it from a 512-glyph sheet whose glyphs are 11 px wide and 16 tall. The
// vendored engine has one byte per letter and glyphs of at most 8 px, so this file stands in at four
// seams, all behind that flag (no Japanese set loaded: none of it runs):
//   Load    the loader keeps a pair whole instead of expanding it as a dictionary word.
//   Decode  the decoder reads a pair as one multibyte letter whose parameter is g, so every scanner of
//           the buffer steps over the second byte the way it steps over any parameter.
//   Glyph   the draw: the glyph's two halves go into the message buffer as an 8 px tile and a 3 px tile.
//   Name    a single byte below the first command is a US letter code (the player's name, a [Number]
//           digit, a session line): it is drawn as the matching Japanese glyph.
//
// Sheet: the Japanese graphics pack's dialogue font (JaGraphics_DialogueFontSync points the dialogue font
// block at it; a set carries no glyphs, so without the pack nothing is drawn and the pen still advances).
// 64 bytes per glyph, four 2bpp 8x8 tiles in the order left-top, left-bottom, right-top, right-bottom. The right tiles hold columns 8-10 in their three high bits, so each half draws exactly
// like a vanilla glyph of width 8 and of width 3.
//
// A name of six letters is 66 px wide, so it fits the 168 px line on its own. A glyph whose 11 px would
// pass the line's right edge still advances the pen but is not drawn: the buffer is 21 tiles per row and
// a write past it would land in the next row's pixels.

enum {
  kLeadFirst = 0x88,
  kLeadLast = 0x89,
  kJapaneseFlag = 4,
  kUsCommandStart = 0x67,
  kUsEscapeFirst = 0x83,
  kUsEscapeLast = 0x87,
  kGlyphCount = 512,
  kGlyphBytes = 64,
  kTileBytes = 16,
  kMaxWidth = 11,
  kHalfWidth = 8,
  kLineWidthPx = 168,
  kSpaceGlyph = 0xff,
  kQuestionGlyph = 0xc6,
  kDigitGlyph = 0xa0,
  kLetterGlyph = 0xaa,
  kCmdIsLetter = 25,  // messaging.c kTextCmd_IsLetter
  kBottomHalfOffset = 0x150,
  kSoundBlip = 12,
};

static const uint16 kRenderPos[3] = {0, 0x2a0, 0x540};
static const uint8 kLinePositions[3] = {0, 0x40, 0x80};
static const uint8 kSetMasks[8] = {0x80, 0x40, 0x20, 0x10, 8, 4, 2, 1};

static bool JapaneseOn(void) {
  return (g_zenv.dialogue_flags & kJapaneseFlag) != 0;
}

static uint32 Packed(int glyph, int multibyte) {
  return (uint32)glyph << 6 | kCmdIsLetter << 1 | (uint32)multibyte;
}

// The Japanese glyph for a US letter code: A-Z and a-z share the capitals, 0-9 the digits, the few
// marks the game's own text uses their kana-set marks, anything else a space.
int DialogWide_GlyphOfUsLetter(uint8 code) {
  if (code < 26) return kLetterGlyph + code;
  if (code < 52) return kLetterGlyph + code - 26;
  if (code < 62) return kDigitGlyph + code - 52;
  switch (code) {
    case 0x3e: return 0xc7;
    case 0x3f: return kQuestionGlyph;
    case 0x40: return 0xc9;
    case 0x41: return 0xcd;
    case 0x42: return 0xc8;
    default: return kSpaceGlyph;
  }
}

// Text_LoadCharacterBuffer: a pair is copied whole. Returns false for any byte that is not a lead.
bool GameHook_DialogWideLoad(uint8 c, const uint8 **src, const uint8 *src_end, uint8 **dst) {
  if (!JapaneseOn() || c < kLeadFirst || c > kLeadLast) return false;
  *(*dst)++ = c;
  *(*dst)++ = (*src < src_end) ? *(*src)++ : 0;
  return true;
}

// Text_DecodeCmd: 0 for a byte this file has no meaning for, else the packed command word.
uint32 GameHook_DialogWideDecode(uint8 a, const uint8 *src) {
  if (!JapaneseOn()) return 0;
  if (a >= kLeadFirst && a <= kLeadLast) return Packed((a - kLeadFirst) << 8 | src[0], 1);
  if (a < kUsCommandStart) return Packed(DialogWide_GlyphOfUsLetter(a), 0);
  // The two-byte escapes of the Latin extras have no picture in this sheet: a question mark.
  if (a >= kUsEscapeFirst && a <= kUsEscapeLast) return Packed(kQuestionGlyph, 1);
  return 0;
}

// One 8x8 tile (16 bytes, plane 0 then plane 1 per row) drawn |width| columns wide with its left edge
// at pixel |pen| of the row whose buffer starts at |base|: the vanilla glyph loop, a tile at a time.
static void DrawTile(const uint8 *tile, int base, int pen, int width) {
  uint8 *mbuf = (uint8 *)messaging_buf;
  for (int i = 0; i != kTileBytes; i += 2) {
    uint16 r4 = (uint16)(tile[i] | tile[i + 1] << 8);
    int y = base + pen * 2;
    int x = (y & 0xff0) + i;
    y = (y >> 1) & 7;
    int cols = width;
    do {
      if (r4 & 0x0080) mbuf[x] ^= kSetMasks[y]; else mbuf[x] &= ~kSetMasks[y];
      if (r4 & 0x8000) mbuf[x + 1] ^= kSetMasks[y]; else mbuf[x + 1] &= ~kSetMasks[y];
      r4 = (r4 & ~0x8080) << 1;
    } while (--cols && ++y != 8);
    x += kTileBytes;
    if (r4 != 0) {
      mbuf[x] = (uint8)r4;
      mbuf[x + 1] = (uint8)(r4 >> 8);
    }
  }
}

static void DrawGlyph(const uint8 *glyph, int pen, int width) {
  int line = vwf_line_ptr;
  int left = width < kHalfWidth ? width : kHalfWidth;
  DrawTile(glyph, line, pen, left);
  DrawTile(glyph + kTileBytes, line + kBottomHalfOffset, pen, left);
  if (width <= kHalfWidth) return;
  DrawTile(glyph + 2 * kTileBytes, line, pen + kHalfWidth, width - kHalfWidth);
  DrawTile(glyph + 3 * kTileBytes, line + kBottomHalfOffset, pen + kHalfWidth, width - kHalfWidth);
}

// VWF_RenderSingle: the whole draw for a Japanese glyph. False leaves the vanilla draw to run.
bool GameHook_DialogWideGlyph(int c) {
  if (!JapaneseOn()) return false;
  if (c != kSpaceGlyph) sound_effect_2 = kSoundBlip;
  vwf_line_speed_cur = vwf_line_speed;
  if (vwf_flag_next_line) {
    vwf_line_ptr = kRenderPos[vwf_curline >> 1];
    vwf_var1 = kLinePositions[vwf_curline >> 1];
    vwf_flag_next_line = 0;
  }
  MemBlk sheet = FindIndexInMemblk(g_zenv.dialogue_font_blk, 0);
  MemBlk widths = FindIndexInMemblk(g_zenv.dialogue_font_blk, 1);
  bool known = c >= 0 && c < kGlyphCount && widths.ptr != NULL && (size_t)c < widths.size;
  uint8 width = known ? widths.ptr[c] : kMaxWidth;
  if (width > kMaxWidth) width = kMaxWidth;
  GameHook_DialogGlyph((uint16)c, vwf_curline >> 1, vwf_arr[vwf_var1], width);
  int i = vwf_var1++;
  uint8 pen = vwf_arr[i];
  vwf_arr[i + 1] = (uint8)(pen + width);
  if (known && sheet.ptr != NULL && sheet.size >= (size_t)(c + 1) * kGlyphBytes && pen + width <= kLineWidthPx)
    DrawGlyph(sheet.ptr + c * kGlyphBytes, pen, width);
  GameHook_DialogGlyphDrawn();
  return true;
}
