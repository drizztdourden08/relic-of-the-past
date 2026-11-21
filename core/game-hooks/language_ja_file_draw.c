/* @layer core-game-hooks @kind native */
// The file names, hearts and blinkers of the Japanese file select, copy and erase screens. Each vendored
// screen copies its stripe table (the host's Japanese one, at its own length) and then writes US
// offsets into it; these hooks run after that and lay the Japanese rows out again. Offsets below are
// byte offsets into the stripe buffer at vram_upload_data. All of it is a no-op unless LanguageJa_On.
#include "game_hooks_internal.h"
#include "src/load_gfx.h"

enum {
  kNamePalette = 0x1c00,
  kBottomTile = 0x10,
  kNameLen = 6,
  kFileBottomRow = 0x32,
  kHeartTile = 0x05c0,
  kHeartsPerRow = 10,
  kCopyBottomRow = 0x16,
  kCopyBlinkAt = 0x24,
  kHeaderTile = 0x0188,
  kHeaderTiles = 7,
  kFileBlock = 0x500,
};

#define selectfile_R16 g_ram[0xc8]
#define selectfile_R20 WORD(g_ram[0xcc])

static uint8 *Stripe(void) {
  return (uint8 *)vram_upload_data;
}

static void CopyTable(int id, int at) {
  memcpy(Stripe() + at, g_language_screens.table[id], g_language_screens.length[id]);
}

// Six name tiles from byte |at|, their bottom halves |bottom| bytes below.
static void DrawName(int k, int at, int bottom) {
  const uint16 *name = (const uint16 *)(g_zenv.sram + kFileBlock * k + kSrmOffs_Name);
  for (int i = 0; i < kNameLen; i++) {
    uint16 t = LanguageJa_NameTile(name[i]) | kNamePalette;
    WORD(Stripe()[at + i * 2]) = t;
    WORD(Stripe()[at + i * 2 + bottom]) = t + kBottomTile;
  }
}

// Blinker patch: the address bytes of the two stripe headers at byte |at| and |at| + 6.
static void PatchBlink(int at, uint8 top, uint8 bottom) {
  Stripe()[at] = 0x62;
  Stripe()[at + 1] = top;
  Stripe()[at + 6] = 0x62;
  Stripe()[at + 7] = bottom;
}

bool GameHook_SelectFileNameJa(int k) {
  static const uint16 kNameAt[3] = {0x0a, 0x6e, 0xd2};
  static const uint16 kHeartsAt[3] = {0x1e, 0x82, 0xe6};
  if (!LanguageJa_On())
    return false;
  DrawName(k, kNameAt[k], kFileBottomRow);
  uint8 *sram = g_zenv.sram + kFileBlock * k;
  int health = sram[kSrmOffs_Health] >> 3;
  uint16 *dst = vram_upload_data + kHeartsAt[k] / 2;
  uint16 *dst_org = dst;
  int row = kHeartsPerRow;
  do {
    *dst++ = kHeartTile;
    if (--row == 0)
      dst = dst_org + kFileBottomRow / 2;
  } while (--health);
  return true;
}

bool GameHook_FilePickerHeaderJa(void) {
  static const uint16 kHeaderAt[2] = {4, 0x16};
  if (!LanguageJa_On())
    return false;
  for (int j = 0; j < 2; j++) {
    uint16 *dst = vram_upload_data + kHeaderAt[j] / 2;
    for (int i = 0; i < kHeaderTiles; i++)
      dst[i] = kHeaderTile;
  }
  return true;
}

void GameHook_CopySelectNamesJa(void) {
  static const uint16 kNameAt[3] = {0x2c, 0x58, 0x84};
  if (!LanguageJa_On())
    return;
  CopyTable(kLangTbl_CopyBlinkTab, 0);
  vram_upload_offset = g_language_screens.length[kLangTbl_CopyBlinkTab] - 1;
  for (int k = 0; k < 3; k++) {
    if (selectfile_arr1[k] & 1)
      DrawName(k, kNameAt[k], kCopyBottomRow);
  }
}

void GameHook_CopySelectBlinkJa(void) {
  if (!LanguageJa_On())
    return;
  CopyTable(kLangTbl_CopyBlinkTab1, kCopyBlinkAt);
  if (selectfile_R16 != 2)
    PatchBlink(kCopyBlinkAt + (selectfile_R16 ? 0x0c : 0), 0x25, 0x45);
}

void GameHook_CopyTargetNamesJa(void) {
  static const uint16 kRowAt[2] = {0x28, 0x54};
  static const uint16 kFileTile[3] = {0x1d41, 0x1d42, 0x1d43};
  if (!LanguageJa_On())
    return;
  CopyTable(kLangTbl_CopyTargetTab0, 0);
  vram_upload_offset = g_language_screens.length[kLangTbl_CopyTargetTab0] - 1;
  for (int k = 0, j = 0; k < 3; k++) {
    if (k * 2 == selectfile_R20)
      continue;
    int at = kRowAt[j++];
    WORD(Stripe()[at]) = kFileTile[k];
    WORD(Stripe()[at + kCopyBottomRow]) = kFileTile[k] + kBottomTile;
    if (selectfile_arr1[k])
      DrawName(k, at + 4, kCopyBottomRow);
  }
}

void GameHook_CopyTargetBlinkJa(void) {
  if (!LanguageJa_On())
    return;
  CopyTable(kLangTbl_CopyTargetTab2, kCopyBlinkAt);
  if (selectfile_R16 == 0) {
    Stripe()[kCopyBlinkAt + 1] = 0xb4;
    Stripe()[kCopyBlinkAt + 7] = 0xd4;
  }
}

void GameHook_KillTargetBlinkJa(void) {
  if (!LanguageJa_On() || selectfile_R16 == 2)
    return;
  PatchBlink(selectfile_R16 ? 0x0c : 0, 0x28, 0x48);
}
