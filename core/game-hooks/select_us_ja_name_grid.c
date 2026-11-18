/* @layer core-game-hooks @kind native */
// The kana grid's pages in the US name entry: which grid row each of the four US rows shows, and the
// BG3 stripes that draw them. The words come from the Japanese set's own name entry tilemap (asset slot
// 6, extracted from the user's cartridge), the row's two tile rows moved from the Japanese grid's place
// to the US grid's and shifted so each cell lands in the US grid's column. See select_us_ja.h.
#include "game_hooks_internal.h"

enum {
  kSlotName = 6,
  kGridRows = 10,
  kGridCols = 32,
  kGridBytes = 320,
  kPageRows = 3,
  kRowsShown = 4,
  kPages = (kGridRows - 1 + kPageRows - 1) / kPageRows,
  kJaTileRow0 = 7,
  kUsTileRow0 = 16,
  kColShift = 11,
  kMapCols = 64,
  kScreenCols = 32,
  kBg3First = 0x6000,
  kBg3End = 0x6800,
  kBg3Screen1 = 0x6400,
  kBlankWord = 0x188,
  kStreamEnd = 0x80,
  kVertical = 0x80,
  kMemset = 0x40,
  kUploadBytes = 0x500,
};

static uint8 g_upload[kUploadBytes];
static bool g_turn_pending;

static const uint8 *Grid(void) {
  const LanguageScreens *s = &g_language_screens;
  bool full = s->table[kLangTbl_NameGrid] != NULL && s->length[kLangTbl_NameGrid] == kGridBytes;
  return full ? (const uint8 *)s->table[kLangTbl_NameGrid] : NULL;
}

static int ControlRow(const uint8 *grid) {
  for (int r = 0; r < kGridRows; r++) {
    for (int c = 0; c < kGridCols; c++) {
      if (grid[r * kGridCols + c] == kNameCellEnd)
        return r;
    }
  }
  return -1;
}

// The grid row virtual row |v| shows: page v / 4, the control row in the fourth US row, -1 past the end.
static int GridRowOf(const uint8 *grid, int v) {
  int control = ControlRow(grid);
  int u = v % kRowsShown;
  if (u == kRowsShown - 1)
    return control;
  int index = v / kRowsShown * kPageRows + u;
  if (index >= kGridRows - 1)
    return -1;
  return index < control ? index : index + 1;
}

uint8 SelectUsJaName_Cell(int v, int col) {
  const uint8 *grid = Grid();
  int row = grid != NULL ? GridRowOf(grid, v) : -1;
  return row < 0 ? kNameCellNone : grid[row * kGridCols + (col & (kGridCols - 1))];
}

int SelectUsJaName_RowsShown(void) {
  return kPages * kRowsShown;
}

// Tile row |tile_row| of the set's tilemap over both BG3 screens, 64 words, the blank where nothing is drawn.
static void JaTileRow(int tile_row, uint16 *row) {
  for (int c = 0; c < kMapCols; c++)
    row[c] = kBlankWord;
  int size = 0;
  const uint8 *p = LanguageScreensAssets_Host(kSlotName, &size);
  int at = 0;
  while (p != NULL && at + 4 <= size && !(p[at] & kStreamEnd)) {
    uint16 addr = (uint16)(p[at] << 8 | p[at + 1]);
    uint8 flags = p[at + 2];
    int len = ((flags << 8 | p[at + 3]) & 0x3fff) + 1;
    int payload = (flags & kMemset) ? 2 : len;
    for (int i = 0; i < len / 2 && at + 4 + payload <= size; i++) {
      int src = (flags & kMemset) ? 0 : 2 * i;
      uint16 a = (uint16)(addr + ((flags & kVertical) ? i * kScreenCols : i));
      if (a < kBg3First || a >= kBg3End || ((a >> 5) & 31) != tile_row)
        continue;
      row[(a & 31) + ((a >> 10) & 1) * kScreenCols] = (uint16)(p[at + 4 + src] | p[at + 5 + src] << 8);
    }
    at += 4 + payload;
  }
}

static void PutHeader(uint8 *p, uint16 addr, int bytes) {
  p[0] = (uint8)(addr >> 8);
  p[1] = (uint8)addr;
  p[2] = (uint8)((bytes - 1) >> 8 & 0x3f);
  p[3] = (uint8)(bytes - 1);
}

// US tile row |us_row| drawn with Japanese tile row |ja_row| (all blank when negative), as one stripe
// per BG3 screen. Returns the bytes written, -1 when |room| is too small.
static int AppendTileRow(uint8 *out, int room, int us_row, int ja_row) {
  int need = 2 * (4 + 2 * kScreenCols);
  if (need > room)
    return -1;
  uint16 ja[kMapCols];
  if (ja_row >= 0)
    JaTileRow(ja_row, ja);
  else
    for (int c = 0; c < kMapCols; c++) ja[c] = kBlankWord;
  for (int half = 0; half < 2; half++) {
    uint8 *p = out + half * (4 + 2 * kScreenCols);
    PutHeader(p, (uint16)((half ? kBg3Screen1 : kBg3First) + us_row * kScreenCols), 2 * kScreenCols);
    for (int c = 0; c < kScreenCols; c++) {
      uint16 w = SelectUsJa_TextWord(ja[(half * kScreenCols + c + kMapCols - kColShift) & (kMapCols - 1)]);
      p[4 + 2 * c] = (uint8)w;
      p[5 + 2 * c] = (uint8)(w >> 8);
    }
  }
  return need;
}

int SelectUsJaName_AppendPage(uint8 *out, int room, bool controls) {
  const uint8 *grid = Grid();
  if (grid == NULL)
    return 0;
  int first = selectfile_var5 / kRowsShown * kRowsShown;
  int at = 0;
  for (int u = 0; u < (controls ? kRowsShown : kPageRows); u++) {
    int row = GridRowOf(grid, first + u);
    for (int half = 0; half < 2; half++) {
      int ja_row = row < 0 ? -1 : kJaTileRow0 + 2 * row + half;
      int n = AppendTileRow(out + at, room - at, kUsTileRow0 + 2 * u + half, ja_row);
      if (n < 0)
        return -1;
      at += n;
    }
  }
  g_turn_pending = false;
  return at;
}

void SelectUsJaName_TurnPage(void) {
  g_turn_pending = true;
}

const uint8 *SelectUsJaName_Upload(const uint8 *p) {
  if (!g_turn_pending)
    return p;
  int at = 0;
  while (!(p[at] & kStreamEnd)) {
    int len = ((p[at + 2] << 8 | p[at + 3]) & 0x3fff) + 1;
    at += 4 + ((p[at + 2] & kMemset) ? 2 : len);
  }
  int room = kUploadBytes - 1 - at;
  if (room < 0)
    return p;
  memcpy(g_upload, p, (size_t)at);
  int n = SelectUsJaName_AppendPage(g_upload + at, room, false);
  if (n < 0)
    return p;
  g_upload[at + n] = 0xff;
  return g_upload;
}

bool SelectUsJaName_Ready(void) {
  int size = 0;
  const uint8 *grid = Grid();
  return grid != NULL && ControlRow(grid) >= 0 && LanguageScreensAssets_Host(kSlotName, &size) != NULL;
}
