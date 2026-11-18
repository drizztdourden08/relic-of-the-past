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

// select_file.c NameFile_DoTheNaming stores a cell's table byte t as (t & 0xf0) * 2 + (t & 0xf).
// Table bytes 0x0b, 0x60, 0x27, 0x24 are L, i, n, k; 0x59 is the blank cell, stored as 0xa9.
static const uint16 kPrefillName[6] = {0x000b, 0x00c0, 0x0047, 0x0044, 0x00a9, 0x00a9};
enum { kBlankNameWord = 0xa9 };

// select_file.c kNamePlayer_Tab3[2 + 3 * 0x20] is the End cell of the uppercase section.
// kNamePlayer_Tab0[2] and kNamePlayer_Tab2[3] are where the strip settles for that cell, so
// writing the live scroll with its target means no scroll plays on entry.
enum {
  kEndCol = 2,
  kEndRow = 3,
  kEndScrollX = 0x10,
  kEndScrollY = 179,
  kNextLetterBox = 4,
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
  kJaGridCols = 32,
  kJaScrollX0 = 0x1f0,
  kJaColPx = 0x10,
  kJaScrollMask = 0x1ff,
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
  for (int c = 0; c < kJaGridCols; c++) {
    if (SelectUsJaName_Cell(kJaControlRow, c) == kNameCellEnd)
      return c;
  }
  return -1;
}

static void ParkOnEnd(bool ja) {
  int col = ja ? JaEndCol() : kEndCol;
  selectfile_var3 = (uint8)col;
  selectfile_var5 = ja ? kJaControlRow : kEndRow;
  selectfile_var8 = ja ? (uint16)((kJaScrollX0 + kJaColPx * col) & kJaScrollMask) : kEndScrollX;
  selectfile_var7 = kEndScrollY;
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
  const uint16 *words = ja ? kPrefillNameJa : kPrefillName;
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
