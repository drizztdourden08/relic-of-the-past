/* @layer core-game-hooks @kind native */
// The Japanese name entry: a kana grid of 10 rows by 32 columns (the host's kLangTbl_NameGrid) that
// scrolls under a fixed column the way the US grid does, a bar that moves between rows, and six name
// boxes side by side. Runs in place of NameFile_DoTheNaming's US grid while LanguageJa_On.
//
// The scroll speeds and the horizontal input are the US ones (NameFile_CheckForScrollInputX). A row
// whose cell under the column is empty (0xff) is skipped when moving up or down. A kana is stored as
// its tile number with kJaNameMark set, a blank as the US blank word. End with a name hands the frame
// back to the vendored code, which saves the file exactly as it does for a US name.
#include "game_hooks_internal.h"
#include "src/load_gfx.h"
#include "src/select_file.h"
#include "src/sprite.h"

enum {
  kRows = 10, kRowStride = 0x20, kCellMask = 0x1ff,
  kBarY0 = 0x3e, kRowPx = 0x10, kScrollX0 = 0x19c, kColPx = 0x10, kScrollMask = 0x1ff,
  kTimerHold = 0x30, kTimerCap = 0x31, kTimerStep = 4,
  kSlots = 6,
  kCellBack = 0xca, kCellForward = 0xcb, kCellBlank = 0xcc, kCellEnd = 0xcd, kCellNone = 0xff,
  kBoxVram = 0x6075, kBoxRowVram = 0x20, kBoxPalette = 0x1c00, kBottomTile = 0x10,
  kBarSprites = 26, kBarX0 = 0x18, kCursorX0 = 0xa8, kCursorY = 0x14,
  kSoundPick = 0x2b, kSoundRefuse = 0x3c,
  kPadDown = 4, kPadVertical = 0xc, kPadDirections = 0x0f, kPadStart = 0x10, kPadAB = 0xc0,
};

static const uint8 *Grid(void) {
  return (const uint8 *)g_language_screens.table[kLangTbl_NameGrid];
}

static uint8 CellAt(int row, int col) {
  return Grid()[(row * kRowStride + col) & kCellMask];
}

static uint16 *NameWord(int slot) {
  return (uint16 *)(g_zenv.sram + attract_legend_ctr + kSrmOffs_Name + slot * 2);
}

static uint16 ScrollTarget(void) {
  return (uint16)((kScrollX0 + kColPx * selectfile_var3) & kScrollMask);
}

// select_file.c kNamePlayer_Tab1 read at the timer's stage: 1 px, then 2, then 4 once held long.
static int ScrollStep(int timer) {
  int stage = (timer - 1) >> 2;
  int size = stage < 8 ? 1 : stage < 12 ? 2 : 4;
  return selectfile_var10 ? -size : size;
}

static void ScrollX(void) {
  for (;;) {
    int timer = selectfile_var9;
    if (timer == 0) {
      NameFile_CheckForScrollInputX();
      return;
    }
    if (timer != kTimerCap)
      selectfile_var9 += kTimerStep;
    if (ScrollTarget() == selectfile_var8) {
      selectfile_var9 = (joypad1H_last & 3) ? kTimerHold : 0;
      NameFile_CheckForScrollInputX();
      continue;
    }
    selectfile_var8 = (selectfile_var8 + ScrollStep(timer)) & kScrollMask;
    return;
  }
}

static void InputY(void) {
  uint8 a = joypad1H_last & kPadVertical;
  if (a == 0) {
    selectfile_arr2[0] = 0;
    return;
  }
  bool top = (a << 1 | selectfile_var5) == 0x10;
  bool bottom = (a << 2 | selectfile_var5) == 0x19;
  if (!top && !bottom) {
    int step = a == kPadDown ? 1 : -1;
    int row = selectfile_var5;
    for (int n = 0; n < kRows; n++) {
      row = (row + step + kRows) % kRows;
      if (CellAt(row, selectfile_var3) != kCellNone)
        break;
    }
    selectfile_var5 = (uint8)row;
    selectfile_var11++;
  }
  selectfile_arr2[1] = a;
}

static void ScrollY(void) {
  for (;;) {
    if (selectfile_var11 == 0) {
      InputY();
      return;
    }
    uint8 diff = selectfile_var7 - (uint8)(kBarY0 + kRowPx * selectfile_var5);
    if (diff != 0) {
      selectfile_var7 += sign8(diff) ? 2 : -2;
      return;
    }
    selectfile_var11 = 0;
    InputY();
  }
}

static void DrawSprites(void) {
  OamEnt *oam = oam_buf;
  for (int i = 0; i != kBarSprites; i++)
    SetOamPlain(oam++, kBarX0 + i * 8, selectfile_var7, 0x2e, 0x3c, 0);
  SetOamPlain(oam, kCursorX0 + selectfile_var4 * 8, kCursorY, 0x29, 0x0c, 0);
}

// The two-row stripe of one name box, as NameFile_DrawSelectedCharacter writes a US letter.
static void DrawBox(int slot, uint16 w) {
  uint16 *dst = vram_upload_data;
  uint16 addr = kBoxVram + slot;
  uint16 tile = LanguageJa_NameTile(w) | kBoxPalette;
  dst[0] = swap16(addr);
  dst[1] = 0x100;
  dst[2] = tile;
  dst[3] = swap16(addr + kBoxRowVram);
  dst[4] = 0x100;
  dst[5] = tile + kBottomTile;
  BYTE(dst[6]) = 0xff;
  nmi_load_bg_from_vram = 1;
}

static void PickLetter(uint16 w) {
  *NameWord(selectfile_var4) = w;
  DrawBox(selectfile_var4, w);
  if (++selectfile_var4 == kSlots)
    selectfile_var4 = 0;
}

// End: an empty name is refused; any other goes to the vendored End this same frame, handed a bare
// Start press so its grid code moves nothing on the way.
static bool HandToVendoredEnd(void) {
  for (int i = 0; i < kSlots; i++) {
    if (*NameWord(i) != kJaNameBlank) {
      joypad1H_last &= ~kPadDirections;
      filtered_joypad_H = kPadStart;
      filtered_joypad_L = 0;
      return true;
    }
  }
  sound_effect_1 = kSoundRefuse;
  return false;
}

// True when the frame is done here, false when the vendored End must run.
static bool HandleInput(void) {
  if (!(filtered_joypad_H & kPadStart)) {
    if (!((filtered_joypad_H & kPadAB) || (filtered_joypad_L & kPadAB)))
      return true;
    sound_effect_1 = kSoundPick;
    uint8 t = CellAt(selectfile_var5, selectfile_var3);
    switch (t) {
    case kCellBack:
      selectfile_var4 = selectfile_var4 ? selectfile_var4 - 1 : kSlots - 1;
      return true;
    case kCellForward:
      if (++selectfile_var4 == kSlots)
        selectfile_var4 = 0;
      return true;
    case kCellNone:
      return true;
    case kCellEnd:
      break;
    default:
      PickLetter(t == kCellBlank ? kJaNameBlank : (uint16)(((t & 0xf0) << 1 | (t & 0xf)) | kJaNameMark));
      return true;
    }
  }
  return !HandToVendoredEnd();
}

void GameHook_NameFileJapaneseInit(void) {
  if (!LanguageJa_On())
    return;
  selectfile_var7 = kBarY0;
  selectfile_var8 = kScrollX0;
}

bool GameHook_NameFileJapanese(void) {
  if (!LanguageJa_On())
    return false;
  ScrollX();
  ScrollY();
  DrawSprites();
  if (selectfile_var9 | selectfile_var11)
    return true;
  return HandleInput();
}
