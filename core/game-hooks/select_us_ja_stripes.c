/* @layer core-game-hooks @kind native */
// The BG3 stripes of the US file select layout, redrawn for a Japanese set: each US label stripe takes
// the set's Japanese line (select_us_ja_labels.c) and every other tile moves onto the Japanese tilemap
// font the file select uploads (language_screens_font.c). See select_us_ja.h.
#include "game_hooks_internal.h"

enum {
  kTileMask = 0x3ff,
  kHighBits = 0xfc00,
  kPaletteBits = 0x1c00,
  kUsTextPalette = 0x1800,
  kJaTextPalette = 0x1c00,
  kFontEnd = 0x1a0,
  kRowHalf = 0x10,
  kJaBlankTile = 0x188,
  kJaDigitTop = 0x141,
  kJaDigitBottom = 0x151,
  kJaDigitMark = 0x198,
  kUsBlankTop = 0xa9,
  kUsBlankBottom = 0xb9,
  kUsDigitTop = 0xe7,
  kUsDigitBottom = 0xf7,
  kUsDigitMark = 0x91,
  kUsDigits = 3,
  kSheetFirst = 0x100,
  kSheetEnd = 0x160,
  kSheetShift = 0xa0,
  kMarkedName = 0x200,
  kMarkedMask = 0x1ff,
  kBg3First = 0x6000,
  kBg3End = 0x6800,
  kBg3Screen1 = 0x6400,
  kStreamEnd = 0x80,
  kVertical = 0x80,
  kMemset = 0x40,
  kOutBytes = 0x1000,
  kSourceUpload = 1,
  kSourceSelect = 6,
  kSourceCopy = 7,
  kSourceErase = 8,
  kModuleSelect = 1,
  kModuleErase = 3,
};

static uint8 g_out[kOutBytes];

// The US text palette (6) moved to the one the Japanese screens draw their text with (7): a Japanese
// glyph draws strokes in a colour palette 6 leaves dark. Other palettes (the hearts) stay.
static uint16 JaPalette(uint16 w) {
  return (w & kPaletteBits) == kUsTextPalette ? (uint16)((w & ~kPaletteBits) | kJaTextPalette) : w;
}

static uint16 FontTile(uint16 w) {
  uint16 hi = w & kHighBits;
  uint16 t = w & kTileMask;
  if (t >= kMarkedName)
    return hi | (t & kMarkedMask);
  if (t >= kSheetEnd)
    return w;
  if (t >= kSheetFirst)
    return hi | (t + kSheetShift);
  if (t == kUsBlankTop || t == kUsBlankBottom)
    return hi | kJaBlankTile;
  if (t >= kUsDigitTop && t < kUsDigitTop + kUsDigits)
    return hi | (kJaDigitTop + t - kUsDigitTop);
  if (t >= kUsDigitBottom && t < kUsDigitBottom + kUsDigits)
    return hi | (kJaDigitBottom + t - kUsDigitBottom);
  if (t == kUsDigitMark)
    return hi | kJaDigitMark;
  return hi | (uint16)(LanguageJa_NameTile(t & ~kRowHalf) + (t & kRowHalf));
}

static uint16 TranslateTile(uint16 w) {
  uint16 out = FontTile(w);
  return (out & kTileMask) < kFontEnd ? JaPalette(out) : out;
}

static uint16 WordAt(const uint8 *p) {
  return (uint16)(p[0] | p[1] << 8);
}

static void PutWord(uint8 *p, uint16 w) {
  p[0] = (uint8)w;
  p[1] = (uint8)(w >> 8);
}

static void PutHeader(uint8 *p, uint16 addr, uint8 flags, int bytes) {
  p[0] = (uint8)(addr >> 8);
  p[1] = (uint8)addr;
  p[2] = (uint8)(flags | ((bytes - 1) >> 8 & 0x3f));
  p[3] = (uint8)(bytes - 1);
}

static bool AllBlank(const uint8 *p, int n) {
  for (int i = 0; i < n; i++) {
    uint16 t = WordAt(p + 2 * i) & kTileMask;
    if (t != kUsBlankTop && t != kUsBlankBottom)
      return false;
  }
  return true;
}

// Writes the label stripe at |addr| (|n| US words at |p|) with its Japanese line, over the columns of
// both. Returns the bytes written, 0 when no label sits there, -1 when |room| is too small.
static int Relabel(int screen, uint16 addr, const uint8 *p, int n, uint8 *out, int room) {
  if (addr >= kBg3Screen1)
    return 0;
  uint16 tiles[kSelectUsJaLineMax];
  int start = 0, col = addr & 31;
  int count = SelectUsJa_Label(screen, (addr >> 5) & 31, col, n, tiles, &start);
  if (count < 0)
    return 0;
  if (AllBlank(p, n))
    count = 0;
  int lo = start < col ? start : col;
  int hi = start + count > col + n ? start + count : col + n;
  int bytes = (hi - lo) * 2;
  if (4 + bytes > room)
    return -1;
  uint16 blank = JaPalette((uint16)((WordAt(p) & kHighBits) | kJaBlankTile));
  PutHeader(out, (uint16)(addr - col + lo), 0, bytes);
  for (int c = lo; c < hi; c++) {
    bool glyph = c >= start && c < start + count;
    PutWord(out + 4 + 2 * (c - lo), glyph ? tiles[c - start] : blank);
  }
  return 4 + bytes;
}

// Copies the stripe at |p| into |out|, its BG3 tiles translated and its label relabelled. Returns the
// bytes written (|*used| the bytes read), or -1 when |room| is too small.
static int Stripe(int screen, const uint8 *p, uint8 *out, int room, int *used) {
  uint16 addr = (uint16)(p[0] << 8 | p[1]);
  uint8 flags = p[2];
  int len = ((flags << 8 | p[3]) & 0x3fff) + 1;
  int payload = (flags & kMemset) ? 2 : len;
  *used = 4 + payload;
  bool bg3 = addr >= kBg3First && addr < kBg3End;
  if (bg3 && !(flags & (kVertical | kMemset)) && (len & 1) == 0) {
    int written = Relabel(screen, addr, p + 4, len / 2, out, room);
    if (written != 0)
      return written;
  }
  if (4 + payload > room)
    return -1;
  memcpy(out, p, (size_t)(4 + payload));
  if (bg3) {
    for (int i = 0; i + 1 < payload; i += 2)
      PutWord(out + 4 + i, TranslateTile(WordAt(p + 4 + i)));
  }
  return 4 + payload;
}

static const uint8 *Translate(int screen, const uint8 *p) {
  int at = 0;
  while (!(p[0] & kStreamEnd)) {
    int used = 0;
    int written = Stripe(screen, p, g_out + at, kOutBytes - 1 - at, &used);
    if (written < 0)
      return NULL;
    at += written;
    p += used;
  }
  g_out[at] = 0xff;
  return g_out;
}

static int ScreenOfSource(int source) {
  switch (source) {
  case kSourceSelect: return kSelectScreen_Select;
  case kSourceCopy: return kSelectScreen_Copy;
  case kSourceErase: return kSelectScreen_Erase;
  case kSourceUpload: return SelectLayout_ScreenNow();
  default: return -1;
  }
}

const uint8 *GameHook_SelectStripes(const uint8 *p, int source) {
  if (main_module_index < kModuleSelect || main_module_index > kModuleErase)
    return p;
  int screen = ScreenOfSource(source);
  if (screen < 0 || !SelectLayout_JapaneseFont() || SelectLayout_ActiveOn(screen) != kSelectLayout_Us)
    return p;
  const uint8 *out = Translate(screen, p);
  return out != NULL ? out : p;
}
