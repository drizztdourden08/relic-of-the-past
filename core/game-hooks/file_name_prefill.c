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
static const uint16 kPrefillName[6] = { 0x000b, 0x00c0, 0x0047, 0x0044, 0x00a9, 0x00a9 };
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

/** Both tile rows of one name box, appended to the stripe list at |dst|. */
static uint16 *AppendNameTile(uint16 *dst, int box, uint16 chr) {
  // select_file.c NameFile_DrawSelectedCharacter: the same two stripes it writes for a typed letter.
  static const uint16 kBoxVram[6] = { 0x84, 0x86, 0x88, 0x8a, 0x8c, 0x8e };
  uint16 addr = kBoxVram[box] | 0x6100;
  dst[0] = swap16(addr);
  dst[1] = 0x100;
  dst[2] = 0x1800 | chr;
  dst[3] = swap16(addr + 0x20);
  dst[4] = 0x100;
  dst[5] = (0x1800 | chr) + 0x10;
  return dst + 6;
}

void GameHook_PrefillFileName(void) {
  if (!g_prefill_armed)
    return;
  g_prefill_armed = false;
  if (!(enhanced_features0 & kFeatures0_PrefillFileName))
    return;

  // NameFile_EraseSave leaves the file block's SRAM offset in attract_legend_ctr.
  uint8 *name = g_zenv.sram + attract_legend_ctr + kSrmOffs_Name;
  uint16 *dst = vram_upload_data;
  for (int i = 0; i < 6; i++) {
    WORD(name[i * 2]) = kPrefillName[i];
    if (kPrefillName[i] != kBlankNameWord)
      dst = AppendNameTile(dst, i, kPrefillName[i]);
  }
  BYTE(dst[0]) = 0xff;
  nmi_load_bg_from_vram = 1;

  selectfile_var3 = kEndCol;
  selectfile_var5 = kEndRow;
  selectfile_var8 = kEndScrollX;
  selectfile_var7 = kEndScrollY;
  selectfile_var4 = kNextLetterBox;
}
