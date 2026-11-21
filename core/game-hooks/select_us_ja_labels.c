/* @layer core-game-hooks @kind native */
// The labels of the US file select layout and the Japanese line each one takes. A label names the US
// stripe it replaces (screen, top row, column, length in words) and where the Japanese set's own screens
// draw the same words: a row of one of its select tilemaps (asset slots 7-9) or of one of its select
// stripes. The Japanese line is read from the set at runtime, never stored here. See select_us_ja.h.
// A centred label sits in the middle of its columns: the select header, in the box select_us_ja_frame.c
// widens to columns 4-20.
#include "game_hooks_internal.h"

enum {
  kTileMask = 0x3ff,
  kJaBlankTile = 0x188,
  kBg3Screen0 = 0x6000,
  kBg3ScreenWords = 0x400,
  kStreamEnd = 0x80,
  kVertical = 0x80,
  kMemset = 0x40,
  kNone = -1,
  kSlotSelect = 7,
  kSlotCopy = 8,
  kSlotErase = 9,
  kHeaderMin = 4,
  kHeaderEnd = 20,
  kWideHeaderMin = 4,
  kWideHeaderEnd = 21,
  kFrameMin = 3,
  kFrameEnd = 29,
  kBoxMin = 17,
  kBoxEnd = 28,
};

typedef struct UsJaLabel {
  uint8 screen, row, col, len;
  int8 slot, table;
  uint8 src_row, min_col, max_end;
  bool centred;
} UsJaLabel;

static const UsJaLabel kLabels[] = {
  {kSelectScreen_Select, 3, 5, 14, kSlotSelect, kNone, 3, kWideHeaderMin, kWideHeaderEnd, true},
  {kSelectScreen_Select, 22, 6, 12, kSlotSelect, kNone, 21, kFrameMin, kFrameEnd},
  {kSelectScreen_Select, 24, 6, 12, kSlotSelect, kNone, 25, kFrameMin, kFrameEnd},
  {kSelectScreen_Copy, 3, 5, 12, kSlotCopy, kNone, 3, kHeaderMin, kHeaderEnd},
  {kSelectScreen_Copy, 24, 6, 4, kSlotCopy, kNone, 25, kFrameMin, kFrameEnd},
  {kSelectScreen_Copy, 8, 4, 11, kNone, kLangTbl_CopyBlinkTab, 6, kFrameMin, kFrameEnd},
  {kSelectScreen_Copy, 10, 17, 11, kNone, kLangTbl_CopyTargetTab0, 6, kBoxMin, kBoxEnd},
  {kSelectScreen_Copy, 22, 6, 7, kNone, kLangTbl_CopyTargetTab2, 22, kFrameMin, kFrameEnd},
  {kSelectScreen_Erase, 3, 5, 12, kSlotErase, kNone, 3, kHeaderMin, kHeaderEnd},
  {kSelectScreen_Erase, 8, 4, 24, kSlotErase, kNone, 6, kFrameMin, kFrameEnd},
  {kSelectScreen_Erase, 10, 4, 10, kNone, kNone, 0, kFrameMin, kFrameEnd},
  {kSelectScreen_Erase, 24, 6, 4, kSlotErase, kNone, 25, kFrameMin, kFrameEnd},
  {kSelectScreen_Erase, 22, 6, 17, kNone, kLangTbl_KillTab2, 21, kFrameMin, kFrameEnd},
  {kSelectScreen_Name, 5, 4, 22, kNone, kNone, 0, kFrameMin, kFrameEnd},
};

static const uint8 *SourceStream(const UsJaLabel *e, int *size) {
  if (e->slot != kNone)
    return LanguageScreensAssets_Host(e->slot, size);
  if (e->table == kNone)
    return NULL;
  *size = g_language_screens.length[e->table];
  return (const uint8 *)g_language_screens.table[e->table];
}

// The words of the first plain horizontal stripe on BG3 screen 0 at |row| of |p|, at most
// kSelectUsJaLineMax, whole: the Japanese screens draw their text in their own palette, which the label
// keeps. Returns their count, 0 when the stream has no such stripe.
static int FindLine(const uint8 *p, int size, int row, uint16 *words) {
  int at = 0;
  while (at + 4 <= size && !(p[at] & kStreamEnd)) {
    uint16 addr = (uint16)(p[at] << 8 | p[at + 1]);
    uint8 flags = p[at + 2];
    int len = ((flags << 8 | p[at + 3]) & 0x3fff) + 1;
    int payload = (flags & kMemset) ? 2 : len;
    bool plain = !(flags & (kVertical | kMemset));
    bool on_row = addr >= kBg3Screen0 && addr < kBg3Screen0 + kBg3ScreenWords && ((addr >> 5) & 31) == row;
    if (plain && on_row && at + 4 + len <= size) {
      int n = len / 2 < kSelectUsJaLineMax ? len / 2 : kSelectUsJaLineMax;
      for (int i = 0; i < n; i++)
        words[i] = (uint16)(p[at + 4 + 2 * i] | p[at + 5 + 2 * i] << 8);
      return n;
    }
    at += 4 + payload;
  }
  return 0;
}

static bool BlankWord(uint16 w) {
  return (w & kTileMask) == kJaBlankTile;
}

static bool BlankColumn(const uint16 *top, const uint16 *bottom, int bottom_n, int i) {
  bool bottom_blank = i >= bottom_n || BlankWord(bottom[i]);
  return BlankWord(top[i]) && bottom_blank;
}

// The Japanese line's columns kept for |half| (0 top, 1 bottom): trimmed of blank ends, and with its
// spacing shortened (single blank columns dropped, longer gaps cut to one) when it is wider than |room|.
static int Compose(const uint16 *top, int n, const uint16 *bottom, int bottom_n, int half, int room, uint16 *out) {
  int first = 0, last = n - 1;
  while (first <= last && BlankColumn(top, bottom, bottom_n, first)) first++;
  while (last >= first && BlankColumn(top, bottom, bottom_n, last)) last--;
  bool tight = last - first + 1 > room;
  int count = 0;
  for (int i = first; i <= last && count < kSelectUsJaLineMax; i++) {
    bool blank = BlankColumn(top, bottom, bottom_n, i);
    bool gap_start = blank && BlankColumn(top, bottom, bottom_n, i + 1) && !BlankColumn(top, bottom, bottom_n, i - 1);
    if (tight && blank && !gap_start)
      continue;
    out[count++] = half ? (i < bottom_n ? bottom[i] : kJaBlankTile) : top[i];
  }
  return count;
}

static const UsJaLabel *FindLabel(int screen, int row, int col, int len) {
  for (size_t i = 0; i < countof(kLabels); i++) {
    const UsJaLabel *e = &kLabels[i];
    if (e->screen == screen && e->col == col && e->len == len && (row == e->row || row == e->row + 1))
      return e;
  }
  return NULL;
}

int SelectUsJa_Label(int screen, int row, int col, int len, uint16 *tiles, int *start) {
  const UsJaLabel *e = FindLabel(screen, row, col, len);
  if (e == NULL)
    return -1;
  *start = e->col;
  int size = 0;
  const uint8 *src = SourceStream(e, &size);
  if (src == NULL)
    return 0;
  uint16 top[kSelectUsJaLineMax], bottom[kSelectUsJaLineMax];
  int n = FindLine(src, size, e->src_row, top);
  int bottom_n = FindLine(src, size, e->src_row + 1, bottom);
  int room = e->max_end - e->min_col;
  int count = Compose(top, n, bottom, bottom_n, row - e->row, room, tiles);
  if (count > room)
    count = room;
  int at = e->centred ? e->min_col + (room - count) / 2 : e->col;
  if (at + count > e->max_end)
    at = e->max_end - count;
  *start = at < e->min_col ? e->min_col : at;
  return count;
}

bool SelectUsJa_Ready(void) {
  if (!LanguageJa_LayoutReady())
    return false;
  int size = 0;
  for (int slot = kSlotSelect; slot <= kSlotErase; slot++) {
    if (LanguageScreensAssets_Host(slot, &size) == NULL)
      return false;
  }
  return true;
}
