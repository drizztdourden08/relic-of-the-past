/* @layer core-game-hooks @kind native */
// A new file's naming screen, opened already named and already parked on End.
//
// The name is six words of SRAM and the screen's cursor is four WRAM variables, so every write
// below is game state and the gate is the WRAM word kRam_Features0 (host_gates.h states that
// rule). With kFeatures0_PrefillFileName clear the hook returns before touching anything, so
// the screen opens on six blank boxes with the strip on A.
//
// The write lands on the first frame of NameFile_DoTheNaming because the submodule before it
// uploads kBgTilemap_1, which is where the blank name boxes come from: a tilemap push any
// earlier would be painted over.
#include "game_hooks_internal.h"
#include "src/features.h"
#include "src/load_gfx.h"

// select_file.c NameFile_DoTheNaming stores a cell's table byte t as (t & 0xf0) * 2 + (t & 0xf),
// and that byte is a tile of the menu font, which is the dialogue font. L, i, n, k are tiles 0x0b,
// 0x22, 0x27, 0x24 in every Latin font. The US grid types a narrow i, tile 0x60, which a European
// font draws as another letter (o circumflex, sharp s), so 0x60 is written only where the active
// grid types it and has no 0x22. The blank cell is stored as 0xa9.
static const uint8 kPrefillLetters[4][2] = {{0x0b, 0x0b}, {0x22, 0x60}, {0x27, 0x27}, {0x24, 0x24}};
enum { kPrefillLength = 4, kBlankNameWord = 0xa9 };

// The grid is 4 rows of 0x20 cells (kNamePlayer_Tab3, or the set's kLangTbl_NameGrid); byte 0x6f
// is End. kNamePlayer_Tab0[col] and kNamePlayer_Tab2[row] are where the strip settles for a cell,
// so writing the live scroll with its target means no scroll plays on entry.
enum {
  kGridCols = 0x20,
  kGridCells = 0x80,
  kGridEnd = 0x6f,
  kUsEndCell = 2 + 3 * kGridCols,
  kScrollX0 = 0x1f0,
  kColPx = 0x10,
  kScrollMask = 0x1ff,
  kRowScrollY0 = 131,
  kRowPx = 16,
  kNextLetterBox = kPrefillLength,
};

static bool g_prefill_armed;

void GameHook_ArmFileNamePrefill(void) {
  g_prefill_armed = true;
}

// The US name entry with a Japanese set (select_us_ja_naming.c) opens named リンク, the Japanese
// cartridge's name for the hero: its katakana as name words (glyph 0x89, 0x5f, 0x5a with kJaNameMark),
// parked on the first page's End cell. The Japanese layout's own grid still opens blank.
static const uint16 kPrefillNameJa[6] = {0x0309, 0x02af, 0x02aa, 0x00a9, 0x00a9, 0x00a9};
enum {
  kJaControlRow = 3,
  kJaNextLetterBox = 3,
  kJaBoxPalette = 0x1c00,
};

/** Both tile rows of one name box, |top| its top tile word, appended to the stripe list at |dst|. */
static uint16 *AppendNameTile(uint16 *dst, int box, uint16 top) {
  // select_file.c NameFile_DrawSelectedCharacter: the same two stripes it writes for a typed letter.
  static const uint16 kBoxVram[6] = {0x84, 0x86, 0x88, 0x8a, 0x8c, 0x8e};
  uint16 addr = kBoxVram[box] | 0x6100;
  dst[0] = swap16(addr);
  dst[1] = 0x100;
  dst[2] = top;
  dst[3] = swap16(addr + 0x20);
  dst[4] = 0x100;
  dst[5] = top + 0x10;
  return dst + 6;
}

static uint16 BoxTile(bool ja, uint16 w) {
  return ja ? SelectUsJa_TextWord(LanguageJa_NameTile(w) | kJaBoxPalette) : (uint16)(0x1800 | w);
}

static int JaEndCol(void) {
  for (int c = 0; c < kGridCols; c++) {
    if (SelectUsJaName_Cell(kJaControlRow, c) == kNameCellEnd)
      return c;
  }
  return -1;
}

/** The set's own name grid and its cell count, or NULL while select_file.c's US grid is used. */
static const int8 *HostGrid(int *cells) {
  int len = LanguageScreens_Len(kLangTbl_NameGrid, 0);
  *cells = len < kGridCells ? len : kGridCells;
  return LANG_PICK(int8, kLangTbl_NameGrid, NULL);
}

static bool GridHas(const int8 *grid, int cells, uint8 tile) {
  for (int i = 0; i < cells; i++) {
    if ((uint8)grid[i] == tile)
      return true;
  }
  return false;
}

/** The tile of prefill letter |k| as the active grid types it. */
static uint8 LetterTile(int k) {
  int cells;
  const int8 *grid = HostGrid(&cells);
  uint8 font = kPrefillLetters[k][0], us = kPrefillLetters[k][1];
  if (grid == NULL || (GridHas(grid, cells, us) && !GridHas(grid, cells, font)))
    return us;
  return font;
}

/** The first End cell of the active grid. */
static int LatinEndCell(void) {
  int cells;
  const int8 *grid = HostGrid(&cells);
  for (int i = 0; grid != NULL && i < cells; i++) {
    if ((uint8)grid[i] == kGridEnd)
      return i;
  }
  return kUsEndCell;
}

static void LatinName(uint16 *words) {
  for (int i = 0; i < 6; i++) {
    uint8 t = i < kPrefillLength ? LetterTile(i) : 0;
    words[i] = i < kPrefillLength ? (uint16)((t & 0xf0) * 2 + (t & 0xf)) : kBlankNameWord;
  }
}

static void ParkOnEnd(bool ja) {
  int cell = ja ? JaEndCol() + kJaControlRow * kGridCols : LatinEndCell();
  int col = cell % kGridCols, row = cell / kGridCols;
  selectfile_var3 = (uint8)col;
  selectfile_var5 = (uint8)row;
  selectfile_var8 = (uint16)((kScrollX0 + kColPx * col) & kScrollMask);
  selectfile_var7 = (uint8)(kRowScrollY0 + kRowPx * row);
  selectfile_var4 = ja ? kJaNextLetterBox : kNextLetterBox;
}

void GameHook_PrefillFileName(void) {
  if (!g_prefill_armed)
    return;
  g_prefill_armed = false;
  if (!(enhanced_features0 & kFeatures0_PrefillFileName))
    return;
  // The Japanese layout's kana grid opens blank; the US layout with a Japanese set gets リンク.
  bool ja = SelectUsJaName_On();
  if (LanguageJa_On() || (ja && JaEndCol() < 0))
    return;

  // NameFile_EraseSave leaves the file block's SRAM offset in attract_legend_ctr.
  uint8 *name = g_zenv.sram + attract_legend_ctr + kSrmOffs_Name;
  uint16 latin[6];
  LatinName(latin);
  const uint16 *words = ja ? kPrefillNameJa : latin;
  uint16 *dst = vram_upload_data;
  for (int i = 0; i < 6; i++) {
    WORD(name[i * 2]) = words[i];
    if (words[i] != kBlankNameWord)
      dst = AppendNameTile(dst, i, BoxTile(ja, words[i]));
  }
  BYTE(dst[0]) = 0xff;
  nmi_load_bg_from_vram = 1;
  ParkOnEnd(ja);
}
