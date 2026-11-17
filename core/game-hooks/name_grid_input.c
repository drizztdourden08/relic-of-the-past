/* @layer core-game-hooks @kind native */
// What the two kana name grids share (language_ja_naming.c in the Japanese layout, select_us_ja_naming.c
// in the US one): the sideways scroll under the fixed column, the bar's slide between rows, the bar and
// box cursor sprites, and a press on a cell. See language_ja_screens.h.
//
// The scroll speeds and the horizontal input are the US ones (NameFile_CheckForScrollInputX). A kana is
// stored as its tile number with kJaNameMark set, a blank as the US blank word. End with a name hands
// the frame back to the vendored code, which saves the file exactly as it does for a US name.
#include "game_hooks_internal.h"
#include "src/load_gfx.h"
#include "src/select_file.h"
#include "src/sprite.h"

enum {
  kColPx = 0x10, kScrollMask = 0x1ff,
  kTimerHold = 0x30, kTimerCap = 0x31, kTimerStep = 4,
  kSlots = 6, kBoxRowVram = 0x20, kBoxPalette = 0x1c00, kBottomTile = 0x10,
  kBarSprites = 26, kBarX0 = 0x18, kBarTile = 0x2e, kBarAttr = 0x3c, kCursorTile = 0x29, kCursorAttr = 0x0c,
  kSoundPick = 0x2b, kSoundRefuse = 0x3c,
  kPadDirections = 0x0f, kPadStart = 0x10, kPadAB = 0xc0,
};

static uint16 *NameWord(int slot) {
  return (uint16 *)(g_zenv.sram + attract_legend_ctr + kSrmOffs_Name + slot * 2);
}

static uint16 ScrollTarget(uint16 origin) {
  return (uint16)((origin + kColPx * selectfile_var3) & kScrollMask);
}

// select_file.c kNamePlayer_Tab1 read at the timer's stage: 1 px, then 2, then 4 once held long.
static int ScrollStep(int timer) {
  int stage = (timer - 1) >> 2;
  int size = stage < 8 ? 1 : stage < 12 ? 2 : 4;
  return selectfile_var10 ? -size : size;
}

void NameGrid_ScrollX(uint16 origin) {
  for (;;) {
    int timer = selectfile_var9;
    if (timer == 0) {
      NameFile_CheckForScrollInputX();
      return;
    }
    if (timer != kTimerCap)
      selectfile_var9 += kTimerStep;
    if (ScrollTarget(origin) == selectfile_var8) {
      selectfile_var9 = (joypad1H_last & 3) ? kTimerHold : 0;
      NameFile_CheckForScrollInputX();
      continue;
    }
    selectfile_var8 = (selectfile_var8 + ScrollStep(timer)) & kScrollMask;
    return;
  }
}

void NameGrid_ScrollY(uint8 (*bar_y)(void), void (*input_y)(void)) {
  for (;;) {
    if (selectfile_var11 == 0) {
      input_y();
      return;
    }
    uint8 diff = selectfile_var7 - bar_y();
    if (diff != 0) {
      selectfile_var7 += sign8(diff) ? 2 : -2;
      return;
    }
    selectfile_var11 = 0;
    input_y();
  }
}

void NameGrid_DrawSprites(uint8 cursor_x, uint8 cursor_y) {
  OamEnt *oam = oam_buf;
  for (int i = 0; i != kBarSprites; i++)
    SetOamPlain(oam++, kBarX0 + i * 8, selectfile_var7, kBarTile, kBarAttr, 0);
  SetOamPlain(oam, cursor_x, cursor_y, kCursorTile, kCursorAttr, 0);
}

// The two-row stripe of one name box at |addr|, as NameFile_DrawSelectedCharacter writes a US letter.
static void DrawBox(uint16 addr, uint16 w) {
  uint16 *dst = vram_upload_data;
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

static void PickLetter(uint16 w, uint16 box_vram, int box_step) {
  *NameWord(selectfile_var4) = w;
  DrawBox((uint16)(box_vram + selectfile_var4 * box_step), w);
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

bool NameGrid_HandleInput(uint8 cell, uint16 box_vram, int box_step) {
  if (!(filtered_joypad_H & kPadStart)) {
    if (!((filtered_joypad_H & kPadAB) || (filtered_joypad_L & kPadAB)))
      return true;
    sound_effect_1 = kSoundPick;
    switch (cell) {
    case kNameCellBack:
      selectfile_var4 = selectfile_var4 ? selectfile_var4 - 1 : kSlots - 1;
      return true;
    case kNameCellForward:
      if (++selectfile_var4 == kSlots)
        selectfile_var4 = 0;
      return true;
    case kNameCellNone:
      return true;
    case kNameCellEnd:
      break;
    default:
      PickLetter(cell == kNameCellBlank ? kJaNameBlank : (uint16)(((cell & 0xf0) << 1 | (cell & 0xf)) | kJaNameMark),
                 box_vram, box_step);
      return true;
    }
  }
  return !HandToVendoredEnd();
}
